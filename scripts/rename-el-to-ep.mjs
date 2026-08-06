import fs from 'fs'
import path from 'path'

const root = path.resolve('src')
const files = []

function walk (dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p)
    else if (/\.(vue|scss|css)$/.test(name)) files.push(p)
  }
}

walk(root)

let changed = 0
for (const file of files) {
  const c = fs.readFileSync(file, 'utf8')
  let n = c
  n = n.replace(/\.el-/g, '.ep-')
  n = n.replace(/--el-/g, '--ep-')
  n = n.replace(/class="el-/g, 'class="ep-')
  n = n.replace(/class='el-/g, "class='ep-")
  // class 列表中间的 EP BEM：el-upload-list / el-icon--right 等
  n = n.replace(/(?<=[\s"'])el-(upload|icon--|form-item|input|select|button|table|dialog|link|pager|tabs|radio|checkbox|date|image|progress|popover|popper|message)/g, 'ep-$1')
  if (n !== c) {
    fs.writeFileSync(file, n)
    changed++
    console.log('OK', path.relative(process.cwd(), file))
  }
}
console.log(`done, changed ${changed}/${files.length}`)
