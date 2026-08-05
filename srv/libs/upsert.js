const cds = require('@sap/cds')

function registerUpsert(srv) {
  srv.before('UPSERT', '*', (req) => {
    // 1. Resolve the actual CDS entity definition (handles raw physical table names)
    const resolved = resolveEntityDef(req.target)

    if (resolved && resolved.name !== req.target?.name) {
      // Rewrite the query target to the fully-qualified entity name
      // so the HANA compiler generates a proper UPSERT/MERGE with correct key handling
      req.query.UPSERT.into = { ref: [resolved.name] }
      req.target = resolved
      console.log(`[upsert-dedupe] resolved target ${req.query?.UPSERT?.into?.ref?.[0]} -> ${resolved.name}`)
    }

    // 2. Dedup entries as before
    const entries = req.query?.UPSERT?.entries
    if (!Array.isArray(entries) || entries.length <= 1) return

    const keyFields = getKeyFields(resolved || req.target)
    if (keyFields.length === 0) {
      console.warn(`[upsert-dedupe] could not resolve key fields for target`, req.target?.name)
      return
    }

    const seen = new Map()
    for (const entry of entries) {
      const key = keyFields.map(f => entry[f]).join('␟')
      seen.set(key, entry)
    }

    const deduped = [...seen.values()]
    if (deduped.length !== entries.length) {
      console.warn(
        `[upsert-dedupe] ${req.target.name}: removed ${entries.length - deduped.length} duplicate(s)`
      )
      req.query.UPSERT.entries = deduped
    }
  })
}

function resolveEntityDef(target) {
  const rawName = target?.name
  if (!rawName) return null

  if (cds.model.definitions[rawName]?.elements) {
    return cds.model.definitions[rawName]
  }

  const match = Object.keys(cds.model.definitions).find(defName => {
    const def = cds.model.definitions[defName]
    if (def.kind !== 'entity') return false
    const physicalName = def['@cds.persistence.name'] || defName.replace(/\./g, '_')
    return physicalName.toUpperCase() === rawName.toUpperCase()
  })

  return match ? cds.model.definitions[match] : null
}

function getKeyFields(def) {
  if (!def?.elements) return []
  return Object.entries(def.elements)
    .filter(([, el]) => el.key === true)
    .map(([name]) => name)
}

module.exports = registerUpsert