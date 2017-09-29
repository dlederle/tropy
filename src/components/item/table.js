'use strict'

const React = require('react')
const PropTypes = require('prop-types')
const { arrayOf, func, object } = PropTypes
const { ItemIterator } = require('./iterator')
const { ItemTableRow } = require('./table-row')
const { ItemTableHead } = require('./table-head')
const cx = require('classnames')
const { noop } = require('../../common/util')
const { ROW } = require('../../constants/sass')


class ItemTable extends ItemIterator {
  get classes() {
    return {
      'table-body': true,
      'drop-target': !this.props.isDisabled,
      'over': this.props.isOver
    }
  }

  getColumns() {
    return 1
  }

  getRowHeight() {
    return ROW.HEIGHT
  }

  handleEditCancel = (...args) => {
    this.props.onEditCancel(...args)
    this.container.focus()
  }


  render() {
    if (this.props.isEmpty) return this.renderNoItems()

    const {
      columns,
      data,
      edit,
      sort,
      onMetadataSave,
      onSort
    } = this.props

    const onEdit = this.props.selection.length === 1 ? this.props.onEdit : noop
    const items = this.props.items.slice(0, this.state.viewportRows)
    const minHeight = this.state.rows * this.getRowHeight()

    return (
      <div
        className="item table"
        ref={this.setContainer}
        tabIndex={this.tabIndex}
        onKeyDown={this.handleKeyDown}>
        <ItemTableHead columns={columns} sort={sort} onSort={onSort}/>

        {this.connect(
          <div
            className={cx(this.classes)}
            onClick={this.handleClickOutside}>
            <div className="scroll-container click-catcher">
              <div style={{ minHeight }}>
                <table>
                  <tbody>
                    {this.map(({ item, ...props }) => (
                      <ItemTableRow {...props}
                        key={item.id}
                        item={item}
                        data={data[item.id]}
                        columns={columns}
                        edit={edit}
                        onCancel={this.handleEditCancel}
                        onChange={onMetadataSave}
                        onEdit={onEdit}/>
                    ), items)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  static propTypes = {
    ...ItemIterator.propTypes,
    columns: arrayOf(object).isRequired,
    edit: object,
    data: object.isRequired,
    onEdit: func.isRequired,
    onEditCancel: func.isRequired,
    onMetadataSave: func.isRequired
  }
}


module.exports = {
  ItemTable
}
