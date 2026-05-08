import { useEffect, useState } from 'react'
import { businessApi, type BusinessItem } from '../../api/business'

export default function BusinessPage() {
  const [items, setItems] = useState<BusinessItem[]>([])
  const [editing, setEditing] = useState<Partial<BusinessItem>>({})
  const [showForm, setShowForm] = useState(false)

  const load = () => businessApi.list().then(setItems)

  useEffect(() => { load() }, [])

  const save = async () => {
    if (editing.id) {
      await businessApi.update(editing.id, { title: editing.title, content: editing.content ?? undefined, status: editing.status })
    } else {
      await businessApi.create(editing as { title: string })
    }
    setShowForm(false)
    setEditing({})
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('确认删除？')) return
    await businessApi.delete(id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>业务管理</h1>
        <button onClick={() => { setEditing({}); setShowForm(true) }} style={btnStyle}>
          + 新增
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #d9d9d9', padding: 16, marginBottom: 16, borderRadius: 6 }}>
          <h3>{editing.id ? '编辑' : '新增'}业务</h3>
          <input placeholder="标题" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} style={inputStyle} />
          <textarea placeholder="内容" value={editing.content || ''} onChange={e => setEditing({ ...editing, content: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={save} style={btnStyle}>保存</button>
            <button onClick={() => setShowForm(false)} style={{ ...btnStyle, marginLeft: 8, background: '#999' }}>取消</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>标题</th>
            <th style={thStyle}>状态</th>
            <th style={thStyle}>更新时间</th>
            <th style={thStyle}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={tdStyle}>{String(item.id)}</td>
              <td style={tdStyle}>{item.title}</td>
              <td style={tdStyle}>{item.status === 1 ? '启用' : '停用'}</td>
              <td style={tdStyle}>{new Date(item.updatedAt).toLocaleString()}</td>
              <td style={tdStyle}>
                <button onClick={() => { setEditing(item); setShowForm(true) }} style={linkStyle}>编辑</button>
                <button onClick={() => remove(Number(item.id))} style={{ ...linkStyle, color: '#ff4d4f', marginLeft: 8 }}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const btnStyle: React.CSSProperties = { padding: '6px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '6px 10px', marginBottom: 8, border: '1px solid #d9d9d9', borderRadius: 4, boxSizing: 'border-box' }
const thStyle: React.CSSProperties = { padding: '10px 12px', fontWeight: 600, borderBottom: '2px solid #e0e0e0' }
const tdStyle: React.CSSProperties = { padding: '10px 12px' }
const linkStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', padding: 0, fontSize: 'inherit' }
