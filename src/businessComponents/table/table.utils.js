import { h } from 'vue'
import dayjs from 'dayjs'


export const formatCellValue = (val, format) => {
    if (val === null || val === undefined || val === '') return '—'

    if (format === 'money') {
        const num = Number(val)
        if (isNaN(num)) return val
        return num.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        })
    }

    const d = dayjs(val)
    return d.isValid() ? d.format(format) : val
}

export const renderCell = (row, col, index) => {
    const { type, keys, separateSymbol = '/', format, prop } = col

    // 1. 多字段拼接 (multKey)
    if (type === 'multKey' && Array.isArray(keys)) {
        const items = keys
            .map(k => row[k])
            .filter(v => v !== null && v !== undefined && v !== '')

        return items.length > 0 ? items.join(` ${separateSymbol} `) : '—'
    }

    // 2. 金额 + 单位 (moneymultKey)
    if (type === 'moneymultKey' && Array.isArray(keys)) {
        const val = row[keys[0]]
        if (val === null || val === undefined || val === '') return '--'

        const formattedMoney = formatCellValue(val, 'money')
        const unitCfg = keys[1]
        const unit = unitCfg?.fix ? unitCfg.key : row[unitCfg?.key]

        // 使用 h 函数构建原有的 HTML 结构
        return h('div', { class: 'otw' }, [
            h('span', {}, `${formattedMoney} ${unit || ''}`)
        ])
    }

    // 3. 多日期拼接 (date)
    if (type === 'date' && Array.isArray(keys)) {
        const items = keys
            .map(k => row[k])
            .filter(v => v !== null && v !== undefined && v !== '')
            .map(v => formatCellValue(v, format))

        return items.length > 0 ? items.join(` ${separateSymbol} `) : '—'
    }

    // 4. 默认处理
    return formatCellValue(row[prop], format)
}
