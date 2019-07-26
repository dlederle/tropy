'use strict'

const React = require('react')
const cx = require('classnames')
const { FormattedMessage } = require('react-intl')
const { auto } = require('../../format')

const {
  arrayOf,
  bool,
  object,
  string
} = require('prop-types')


const MetadataField = ({ isExtra, label, text, type }) => (
  <li className={cx('metadata-field', { extra: isExtra })}>
    <label>{label}</label>
    <div className="value">{auto(text, type)}</div>
  </li>
)

MetadataField.propTypes = {
  isExtra: bool,
  label: string.isRequired,
  text: string,
  type: string.isRequired
}

const MetadataSection = ({ fields, title }) => (
  <section>
    <h5 className="metadata-heading">
      <FormattedMessage id={title} values={{ count: 1 }}/>
    </h5>
    <ol className="metadata-fields">
      {fields.map(f =>
        <MetadataField
          key={f.property.id}
          isExtra={f.isExtra}
          label={f.label || f.property.label}
          text={f.value.text}
          type={f.value.type || f.type}/>)}
    </ol>
  </section>
)

MetadataSection.propTypes = {
  fields: arrayOf(object),
  title: string.isRequired
}

module.exports = {
  MetadataField,
  MetadataSection
}