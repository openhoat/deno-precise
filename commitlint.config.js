const Configuration = {
  parserPreset: {
    parserOpts: {
      headerCorrespondence: ['type', 'ticket', 'subject'],
      headerPattern:
        /^\[(\w+)]( #[\w-]+)? ([A-Z]+[\w\s,;:!?./§*%$£&"#'(\-|`_\\^@)°+=€]*)$/,
    },
  },
  rules: {
    'subject-empty': [2, 'never'],
    'type-enum': [2, 'always', [
      'BUILD',
      'DOC',
      'FEAT',
      'FIX',
      'REFACTOR',
      'TEST',
      'UPGRADE',
    ]],
  },
}

module.exports = Configuration
