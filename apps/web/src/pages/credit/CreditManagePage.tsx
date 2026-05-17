import { useEffect, useState } from 'react'
import { creditAdminApi, type CreditPackageItem, type CreditOrderItem, type CreditLogItem } from '../../api/credit-admin'

type Tab = 'packages' | 'orders' | 'logs'

export default function CreditManagePage() {
  const [tab, setTab] = useState<Tab>('packages')

  return (
    <div>
      <h1>AI 点数管理</h1>
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        {(['packages', 'orders', 'logs'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 16px',
              background: tab === t ? '#1677ff' : '#f5f5f5',
              color: tab === t ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {t === 'packages' ? '套餐管理' : t === 'orders' ? '购买订单' : '点数流水'}
          </button>
        ))}
      </div>

      {tab === 'packages' && <CreditPackageList />}
      {tab === 'orders' && <CreditOrderList />}
      {tab === 'logs' && <CreditLogList />}
    </div>
  )
}

function CreditPackageList() {
  const [items, setItems] = useState<CreditPackageItem[]>([])
  const [editing, setEditing] = useState<Partial<CreditPackageItem>>({})
  const [showForm, setShowForm] = useState(false)

  const load = () => creditAdminApi.listPackages().then(setItems)
  useEffect(() => { load() }, [])

  const save = async () => {
    if (editing.id) {
      await creditAdminApi.updatePackage(editing.id, editing)
    } else {
      await creditAdminApi.createPackage(editing as { name: string; points: number; priceCent: number })
    }
    setShowForm(false)
    setEditing({})
    load()
  }

  const remove = async (id: number) => {
    if (!confirm('确认删除？')) return
    await creditAdminApi.deletePackage(id)
    load()
  }

  return (
    <div>
      <button onClick={() => { setEditing({}); setShowForm(true) }} style={btnStyle}>+ 新增套餐</button>

      {showForm && (
        <div style={{ border: '1px solid #d9d9d9', padding: 16, margin: '12px 0', borderRadius: 6 }}>
          <input placeholder="名称" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} style={inputStyle} />
          <input placeholder="点数" type="number" value={editing.points || ''} onChange={e => setEditing({ ...editing, points: Number(e.target.value) })} style={inputStyle} />
          <input placeholder="价格(分)" type="number" value={editing.priceCent || ''} onChange={e => setEditing({ ...editing, priceCent: Number(e.target.value) })} style={inputStyle} />
          <input placeholder="描述" value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} style={inputStyle} />
          <div>
            <button onClick={save} style={btnStyle}>保存</button>
            <button onClick={() => setShowForm(false)} style={{ ...btnStyle, marginLeft: 8, background: '#999' }}>取消</button>
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>名称</th>
            <th style={thStyle}>点数</th>
            <th style={thStyle}>价格</th>
            <th style={thStyle}>启用</th>
            <th style={thStyle}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(pkg => (
            <tr key={pkg.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={tdStyle}>{String(pkg.id)}</td>
              <td style={tdStyle}>{pkg.name}</td>
              <td style={tdStyle}>{pkg.points.toLocaleString()}</td>
              <td style={tdStyle}>¥{(pkg.priceCent / 100).toFixed(2)}</td>
              <td style={tdStyle}>{pkg.isActive ? '✅' : '❌'}</td>
              <td style={tdStyle}>
                <button onClick={() => { setEditing(pkg); setShowForm(true) }} style={linkStyle}>编辑</button>
                <button onClick={() => remove(Number(pkg.id))} style={{ ...linkStyle, color: '#ff4d4f', marginLeft: 8 }}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CreditOrderList() {
  const [items, setItems] = useState<CreditOrderItem[]>([])
  const load = () => creditAdminApi.listOrders().then(setItems)
  useEffect(() => { load() }, [])

  const confirmOrder = async (id: number) => {
    await creditAdminApi.confirmOrder(id)
    load()
  }

  const refundOrder = async (id: number) => {
    if (!confirm('确认退款？')) return
    await creditAdminApi.refundOrder(id)
    load()
  }

  const statusLabel = (s: number) => s === 0 ? '待支付' : s === 1 ? '已支付' : s === 2 ? '已失败' : '已退款'

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
          <th style={thStyle}>ID</th>
          <th style={thStyle}>用户</th>
          <th style={thStyle}>点数</th>
          <th style={thStyle}>金额</th>
          <th style={thStyle}>状态</th>
          <th style={thStyle}>时间</th>
          <th style={thStyle}>操作</th>
        </tr>
      </thead>
      <tbody>
        {items.map(order => (
          <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={tdStyle}>{String(order.id)}</td>
            <td style={tdStyle}>{order.openId}</td>
            <td style={tdStyle}>{order.points.toLocaleString()}</td>
            <td style={tdStyle}>¥{(order.amountCent / 100).toFixed(2)}</td>
            <td style={tdStyle}>{statusLabel(order.status)}</td>
            <td style={tdStyle}>{new Date(order.createdAt).toLocaleString()}</td>
            <td style={tdStyle}>
              {order.status === 0 && (
                <button onClick={() => confirmOrder(Number(order.id))} style={linkStyle}>确认到账</button>
              )}
              {order.status === 1 && (
                <button onClick={() => refundOrder(Number(order.id))} style={{ ...linkStyle, color: '#ff4d4f', marginLeft: 8 }}>退款</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CreditLogList() {
  const [items, setItems] = useState<CreditLogItem[]>([])
  const load = () => creditAdminApi.listLogs().then(setItems)
  useEffect(() => { load() }, [])

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
          <th style={thStyle}>ID</th>
          <th style={thStyle}>用户</th>
          <th style={thStyle}>点数变化</th>
          <th style={thStyle}>余额</th>
          <th style={thStyle}>动作</th>
          <th style={thStyle}>时间</th>
        </tr>
      </thead>
      <tbody>
        {items.map(log => (
          <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={tdStyle}>{String(log.id)}</td>
            <td style={tdStyle}>{log.openId}</td>
            <td style={{ ...tdStyle, color: log.points > 0 ? '#52c41a' : '#ff4d4f' }}>
              {log.points > 0 ? `+${log.points}` : log.points}
            </td>
            <td style={tdStyle}>{log.balanceAfter.toLocaleString()}</td>
            <td style={tdStyle}>{log.action}</td>
            <td style={tdStyle}>{new Date(log.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const btnStyle: React.CSSProperties = { padding: '6px 16px', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '6px 10px', marginBottom: 8, border: '1px solid #d9d9d9', borderRadius: 4, boxSizing: 'border-box' }
const thStyle: React.CSSProperties = { padding: '10px 12px', fontWeight: 600, borderBottom: '2px solid #e0e0e0' }
const tdStyle: React.CSSProperties = { padding: '10px 12px' }
const linkStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#1677ff', cursor: 'pointer', padding: 0, fontSize: 'inherit' }
