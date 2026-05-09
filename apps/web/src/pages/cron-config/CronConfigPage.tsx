import { useEffect, useState } from "react";
import {
  cronConfigApi,
  type CronConfigItem,
  type ExecutionLogItem,
} from "../../api/cron-config";

const CRON_PRESETS: { label: string; value: string }[] = [
  { label: "每5分钟", value: "*/5 * * * *" },
  { label: "每10分钟", value: "*/10 * * * *" },
  { label: "每30分钟", value: "*/30 * * * *" },
  { label: "每小时整点", value: "0 * * * *" },
  { label: "每2小时", value: "0 */2 * * *" },
  { label: "每天 08:00", value: "0 8 * * *" },
  { label: "每天 09:00", value: "0 9 * * *" },
  { label: "每天 18:00", value: "0 18 * * *" },
  { label: "每天凌晨", value: "0 0 * * *" },
  { label: "工作日 09:00", value: "0 9 * * 1-5" },
  { label: "每周一凌晨", value: "0 0 * * 1" },
  { label: "每月1号凌晨", value: "0 0 1 * *" },
];

export default function CronConfigPage() {
  const [items, setItems] = useState<CronConfigItem[]>([]);
  const [editing, setEditing] = useState<Partial<CronConfigItem>>({});
  const [showForm, setShowForm] = useState(false);
  const [isCustomCron, setIsCustomCron] = useState(false);

  // 执行记录
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [logs, setLogs] = useState<ExecutionLogItem[]>([]);
  // 本地开发默认 dev，部署后默认 online
  const [logEnv, setLogEnv] = useState<string>(
    window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
      ? "dev"
      : "online",
  );
  const [executingIds, setExecutingIds] = useState<Set<number>>(new Set());
  const [execError, setExecError] = useState<string | null>(null);

  const load = () => cronConfigApi.list().then(setItems);

  useEffect(() => {
    load();
  }, []);

  // 选中配置变化时加载日志
  useEffect(() => {
    if (selectedId == null) return;
    cronConfigApi
      .logs(selectedId, logEnv)
      .then(setLogs)
      .catch(() => setLogs([]));
  }, [selectedId, logEnv]);

  const save = async () => {
    try {
      if (editing.id) {
        await cronConfigApi.update(editing.id, {
          name: editing.name,
          cronExpr: editing.cronExpr,
          taskType: editing.taskType,
          taskParams: editing.taskParams ?? undefined,
          status: editing.status,
        });
      } else {
        const data = {
          name: editing.name!,
          cronExpr: editing.cronExpr!,
          taskType: editing.taskType!,
          taskParams: editing.taskParams ?? undefined,
        };
        await cronConfigApi.create(data);
      }
      setShowForm(false);
      setEditing({});
      setExecError(null);
      load();
    } catch (err: any) {
      setExecError(err.message || "保存失败");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("确认删除？")) return;
    await cronConfigApi.delete(id);
    if (selectedId === id) {
      setSelectedId(null);
      setLogs([]);
    }
    load();
  };

  const handleExecute = async (id: number) => {
    setExecutingIds((prev) => new Set(prev).add(id));
    setExecError(null);
    setSelectedId(id);
    try {
      await cronConfigApi.execute(id);
      const newLogs = await cronConfigApi.logs(id, logEnv);
      setLogs(newLogs);
    } catch (err: any) {
      setExecError(err.message || "执行失败");
    } finally {
      setExecutingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const envLabel: Record<string, string> = {
    online: "线上",
    dev: "开发",
    all: "全部",
  };
  const envList = ["online", "dev"];

  return (
    <div>
      <h1>定时任务配置1</h1>

      {/* 错误提示 */}
      {execError && (
        <div
          style={{
            padding: "8px 12px",
            background: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: 4,
            marginBottom: 12,
            color: "#ff4d4f",
          }}
        >
          {execError}
          <button
            onClick={() => setExecError(null)}
            style={{
              marginLeft: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ff4d4f",
              textDecoration: "underline",
            }}
          >
            关闭
          </button>
        </div>
      )}

      {/* 新增按钮 */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => {
            setEditing({});
            setIsCustomCron(false);
            setShowForm(true);
          }}
          style={btnStyle}
        >
          + 新增
        </button>
      </div>

      {/* CRUD 表单 */}
      {showForm && (
        <div
          style={{
            border: "1px solid #d9d9d9",
            padding: 16,
            marginBottom: 16,
            borderRadius: 6,
          }}
        >
          <h3 style={{ margin: "0 0 12px" }}>
            {editing.id ? "编辑" : "新增"}定时任务
          </h3>
          <input
            placeholder="任务名称"
            value={editing.name || ""}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            style={inputStyle}
          />
          <select
            value={isCustomCron ? "__custom__" : editing.cronExpr || ""}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setIsCustomCron(true);
                setEditing({ ...editing, cronExpr: "" });
              } else {
                setIsCustomCron(false);
                setEditing({ ...editing, cronExpr: e.target.value });
              }
            }}
            style={inputStyle}
          >
            <option value="">-- 请选择 --</option>
            {CRON_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
            <option value="__custom__">自定义</option>
          </select>
          {isCustomCron && (
            <input
              placeholder="输入 Cron 表达式，如 */5 * * * *"
              value={editing.cronExpr || ""}
              onChange={(e) =>
                setEditing({ ...editing, cronExpr: e.target.value })
              }
              style={inputStyle}
            />
          )}
          <input
            placeholder="任务类型 (如: feishu_sync)"
            value={editing.taskType || ""}
            onChange={(e) =>
              setEditing({ ...editing, taskType: e.target.value })
            }
            style={inputStyle}
          />
          <textarea
            placeholder='任务参数 (JSON), 如: {"appToken":"...","tableId":"..."}'
            value={editing.taskParams || ""}
            onChange={(e) =>
              setEditing({ ...editing, taskParams: e.target.value })
            }
            style={{ ...inputStyle, minHeight: 60 }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={save} style={btnStyle}>
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{ ...btnStyle, marginLeft: 8, background: "#999" }}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 配置列表 */}
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>名称</th>
              <th style={thStyle}>Cron 表达式</th>
              <th style={thStyle}>任务类型</th>
              <th style={thStyle}>状态</th>
              <th style={thStyle}>更新时间</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  background: selectedId === item.id ? "#e6f4ff" : undefined,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedId(Number(item.id))}
              >
                <td style={tdStyle}>{String(item.id)}</td>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>
                  <code>{item.cronExpr}</code>
                </td>
                <td style={tdStyle}>{item.taskType}</td>
                <td style={tdStyle}>{item.status === 1 ? "启用" : "停用"}</td>
                <td style={tdStyle}>
                  {new Date(item.updatedAt).toLocaleString()}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(item);
                      setIsCustomCron(
                        !CRON_PRESETS.some((p) => p.value === item.cronExpr),
                      );
                      setShowForm(true);
                    }}
                    style={linkStyle}
                  >
                    编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(Number(item.id));
                    }}
                    style={{ ...linkStyle, color: "#ff4d4f", marginLeft: 8 }}
                  >
                    删除
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecute(Number(item.id));
                    }}
                    disabled={executingIds.has(Number(item.id))}
                    style={{ ...linkStyle, color: "#52c41a", marginLeft: 8 }}
                  >
                    {executingIds.has(Number(item.id)) ? "执行中..." : "执行"}
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ ...tdStyle, textAlign: "center", color: "#999" }}
                >
                  暂无配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 执行记录 */}
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            background: "#fafafa",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ margin: 0, flex: 1 }}>执行记录</h3>
          <div style={{ display: "flex", gap: 4 }}>
            {envList.map((env) => (
              <button
                key={env}
                onClick={() => setLogEnv(env)}
                style={{
                  padding: "4px 12px",
                  border: `1px solid ${logEnv === env ? "#1677ff" : "#d9d9d9"}`,
                  borderRadius: 4,
                  background: logEnv === env ? "#1677ff" : "#fff",
                  color: logEnv === env ? "#fff" : "#333",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {envLabel[env]}
              </button>
            ))}
          </div>
        </div>

        {selectedId == null ? (
          <div
            style={{ padding: "40px 16px", textAlign: "center", color: "#999" }}
          >
            请选择一条定时任务查看执行记录
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{ padding: "40px 16px", textAlign: "center", color: "#999" }}
          >
            暂无执行记录
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th style={thStyle}>开始时间</th>
                <th style={thStyle}>结束时间</th>
                <th style={thStyle}>状态</th>
                <th style={thStyle}>环境</th>
                <th style={thStyle}>错误信息</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={tdStyle}>
                    {new Date(log.startTime).toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    {log.endTime ? new Date(log.endTime).toLocaleString() : "-"}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        background:
                          log.status === 1
                            ? "#f6ffed"
                            : log.status === 0
                              ? "#fff2f0"
                              : "#f5f5f5",
                        color:
                          log.status === 1
                            ? "#52c41a"
                            : log.status === 0
                              ? "#ff4d4f"
                              : "#999",
                        border: `1px solid ${log.status === 1 ? "#b7eb8f" : log.status === 0 ? "#ffccc7" : "#d9d9d9"}`,
                      }}
                    >
                      {log.status === 1
                        ? "成功"
                        : log.status === 0
                          ? "失败"
                          : "未知"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        fontSize: 12,
                        color: log.env === "online" ? "#1677ff" : "#722ed1",
                      }}
                    >
                      {log.env === "online" ? "线上" : "开发"}
                    </span>
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: log.errorMsg ? "#ff4d4f" : "#999",
                    }}
                  >
                    {log.errorMsg || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "6px 16px",
  background: "#1677ff",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};
const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "6px 10px",
  marginBottom: 8,
  border: "1px solid #d9d9d9",
  borderRadius: 4,
  boxSizing: "border-box",
};
const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  fontWeight: 600,
  borderBottom: "2px solid #e0e0e0",
};
const tdStyle: React.CSSProperties = { padding: "10px 12px" };
const linkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#1677ff",
  cursor: "pointer",
  padding: 0,
  fontSize: "inherit",
};
