export function ERDiagram() {
  const tables = [
    {
      id: "users",
      label: "users",
      x: 60,
      y: 320,
      color: "#3b82f6",
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "name", type: "TEXT" },
        { name: "login", type: "TEXT UNIQUE" },
        { name: "password", type: "TEXT" },
        { name: "role", type: "TEXT" },
        { name: "group_name", type: "TEXT" },
        { name: "avatar", type: "TEXT" },
        { name: "health_doc", type: "TEXT" },
        { name: "student_id", type: "TEXT" },
      ],
    },
    {
      id: "sections",
      label: "sections",
      x: 460,
      y: 60,
      color: "#10b981",
      fields: [
        { name: "id", type: "TEXT", pk: true },
        { name: "title", type: "TEXT" },
        { name: "coach_id", type: "INTEGER", fk: "users.id" },
        { name: "place", type: "TEXT" },
        { name: "color", type: "TEXT" },
        { name: "image", type: "TEXT" },
        { name: "description", type: "TEXT" },
        { name: "max_students", type: "INTEGER" },
      ],
    },
    {
      id: "bookings",
      label: "bookings",
      x: 460,
      y: 440,
      color: "#f59e0b",
      fields: [
        { name: "bookingId", type: "INTEGER", pk: true },
        { name: "sectionId", type: "TEXT" },
        { name: "user", type: "TEXT" },
        { name: "date", type: "TEXT" },
        { name: "docType", type: "TEXT" },
        { name: "status", type: "TEXT" },
      ],
    },
    {
      id: "schedule",
      label: "schedule",
      x: 860,
      y: 60,
      color: "#8b5cf6",
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "day_of_week", type: "TEXT" },
        { name: "time", type: "TEXT" },
        { name: "section_id", type: "TEXT", fk: "sections.id" },
        { name: "coach_id", type: "INTEGER" },
      ],
    },
    {
      id: "messages",
      label: "messages",
      x: 860,
      y: 360,
      color: "#ec4899",
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "sender_id", type: "INTEGER", fk: "users.id" },
        { name: "receiver_id", type: "INTEGER", fk: "users.id" },
        { name: "text", type: "TEXT" },
        { name: "read", type: "INTEGER" },
        { name: "created_at", type: "TEXT" },
      ],
    },
    {
      id: "attendance",
      label: "attendance",
      x: 860,
      y: 620,
      color: "#f97316",
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "student_name", type: "TEXT" },
        { name: "section_id", type: "TEXT" },
        { name: "section_title", type: "TEXT" },
        { name: "coach_id", type: "INTEGER" },
        { name: "date", type: "TEXT" },
        { name: "present", type: "INTEGER" },
      ],
    },
    {
      id: "student_registry",
      label: "student_registry",
      x: 60,
      y: 700,
      color: "#14b8a6",
      fields: [
        { name: "student_id", type: "TEXT", pk: true },
        { name: "first_name", type: "TEXT" },
        { name: "last_name", type: "TEXT" },
        { name: "middle_name", type: "TEXT" },
        { name: "group_name", type: "TEXT" },
      ],
    },
    {
      id: "pending_registrations",
      label: "pending_registrations",
      x: 460,
      y: 700,
      color: "#ef4444",
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "login", type: "TEXT" },
        { name: "password", type: "TEXT" },
        { name: "last_name", type: "TEXT" },
        { name: "first_name", type: "TEXT" },
        { name: "middle_name", type: "TEXT" },
        { name: "student_id", type: "TEXT" },
        { name: "email", type: "TEXT" },
        { name: "ip", type: "TEXT" },
        { name: "status", type: "TEXT" },
        { name: "rejection_reason", type: "TEXT" },
        { name: "created_at", type: "TEXT" },
      ],
    },
    {
      id: "section_posts",
      label: "section_posts",
      x: 1240,
      y: 60,
      color: "#6366f1",
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "section_id", type: "TEXT", fk: "sections.id" },
        { name: "coach_id", type: "INTEGER" },
        { name: "text", type: "TEXT" },
        { name: "created_at", type: "TEXT" },
      ],
    },
  ];

  const ROW_H = 24;
  const HEADER_H = 36;
  const PAD = 0;
  const COL_W = 340;

  function tableHeight(t: (typeof tables)[0]) {
    return HEADER_H + t.fields.length * ROW_H + PAD * 2;
  }

  function tableRight(t: (typeof tables)[0]) {
    return t.x + COL_W;
  }

  function rowY(t: (typeof tables)[0], fieldIdx: number) {
    return t.y + HEADER_H + PAD + fieldIdx * ROW_H + ROW_H / 2;
  }

  function fieldIndex(tableId: string, fieldName: string) {
    const t = tables.find((x) => x.id === tableId)!;
    return t.fields.findIndex((f) => f.name === fieldName);
  }

  type Rel = {
    from: string;
    fromField: string;
    to: string;
    toField: string;
    card: "one" | "many";
    label?: string;
  };

  const relations: Rel[] = [
    { from: "sections", fromField: "coach_id", to: "users", toField: "id", card: "many" },
    { from: "messages", fromField: "sender_id", to: "users", toField: "id", card: "many", label: "sender" },
    { from: "messages", fromField: "receiver_id", to: "users", toField: "id", card: "many", label: "receiver" },
    { from: "schedule", fromField: "section_id", to: "sections", toField: "id", card: "many" },
    { from: "section_posts", fromField: "section_id", to: "sections", toField: "id", card: "many" },
  ];

  function crowFoot(x: number, y: number, dir: "left" | "right", type: "one" | "many") {
    const size = 10;
    const gap = 6;
    if (type === "many") {
      if (dir === "right") {
        return (
          <g>
            <line x1={x} y1={y} x2={x + size} y2={y - size} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x + size} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x + size} y2={y} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x + size + gap} y1={y - size} x2={x + size + gap} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
          </g>
        );
      } else {
        return (
          <g>
            <line x1={x} y1={y} x2={x - size} y2={y - size} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x - size} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x - size} y2={y} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x - size - gap} y1={y - size} x2={x - size - gap} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
          </g>
        );
      }
    } else {
      if (dir === "right") {
        return (
          <g>
            <line x1={x + gap} y1={y - size} x2={x + gap} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x + gap * 2} y1={y - size} x2={x + gap * 2} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
          </g>
        );
      } else {
        return (
          <g>
            <line x1={x - gap} y1={y - size} x2={x - gap} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x - gap * 2} y1={y - size} x2={x - gap * 2} y2={y + size} stroke="#94a3b8" strokeWidth={1.5} />
          </g>
        );
      }
    }
  }

  function renderRelation(rel: Rel, idx: number) {
    const fromTable = tables.find((t) => t.id === rel.from)!;
    const toTable = tables.find((t) => t.id === rel.to)!;
    const fromFi = fieldIndex(rel.from, rel.fromField);
    const toFi = fieldIndex(rel.to, rel.toField);

    const fromY = rowY(fromTable, fromFi);
    const toY = rowY(toTable, toFi);

    const fromRight = tableRight(fromTable);
    const toRight = tableRight(toTable);

    let x1: number, x2: number, fromDir: "left" | "right", toDir: "left" | "right";

    if (fromTable.x > toTable.x + COL_W) {
      x1 = fromTable.x;
      x2 = toRight;
      fromDir = "left";
      toDir = "right";
    } else if (toTable.x > fromTable.x + COL_W) {
      x1 = fromRight;
      x2 = toTable.x;
      fromDir = "right";
      toDir = "left";
    } else {
      x1 = fromRight;
      x2 = toTable.x;
      fromDir = "right";
      toDir = "left";
    }

    const midX = (x1 + x2) / 2 + (idx % 2 === 0 ? 0 : idx * 4 - 8);

    const path = `M ${x1} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${x2} ${toY}`;

    return (
      <g key={`${rel.from}-${rel.fromField}-${rel.to}-${idx}`}>
        <path d={path} fill="none" stroke="#475569" strokeWidth={1.5} strokeDasharray={rel.label ? "5,3" : "none"} />
        {crowFoot(x1, fromY, fromDir, "many")}
        {crowFoot(x2, toY, toDir, "one")}
        {rel.label && (
          <text x={midX} y={(fromY + toY) / 2 - 6} textAnchor="middle" fill="#94a3b8" fontSize={10} fontFamily="monospace">
            {rel.label}
          </text>
        )}
      </g>
    );
  }

  const svgW = 1620;
  const svgH = 980;

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: 24, fontFamily: "monospace" }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: "#94a3b8", fontSize: 13 }}>КГУ СПОРТ — </span>
        <span style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>ER-диаграмма базы данных (Crow's Foot)</span>
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto" }}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
            </filter>
          </defs>

          {relations.map((rel, i) => renderRelation(rel, i))}

          {tables.map((t) => {
            const h = tableHeight(t);
            return (
              <g key={t.id} filter="url(#shadow)">
                <rect x={t.x} y={t.y} width={COL_W} height={h} rx={8} fill="#1e293b" stroke={t.color} strokeWidth={2} />
                <rect x={t.x} y={t.y} width={COL_W} height={HEADER_H} rx={8} fill={t.color} />
                <rect x={t.x} y={t.y + HEADER_H - 4} width={COL_W} height={8} fill={t.color} />
                <text x={t.x + COL_W / 2} y={t.y + HEADER_H / 2 + 5} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700} fontFamily="monospace">
                  {t.label}
                </text>

                {t.fields.map((f, fi) => {
                  const fy = t.y + HEADER_H + PAD + fi * ROW_H;
                  const isLast = fi === t.fields.length - 1;
                  return (
                    <g key={f.name}>
                      {!isLast && (
                        <line x1={t.x + 1} y1={fy + ROW_H} x2={t.x + COL_W - 1} y2={fy + ROW_H} stroke="#334155" strokeWidth={1} />
                      )}
                      {f.pk && (
                        <text x={t.x + 12} y={fy + ROW_H / 2 + 4} fill="#fbbf24" fontSize={10} fontFamily="monospace" fontWeight={700}>
                          PK
                        </text>
                      )}
                      {f.fk && !f.pk && (
                        <text x={t.x + 12} y={fy + ROW_H / 2 + 4} fill="#60a5fa" fontSize={10} fontFamily="monospace" fontWeight={700}>
                          FK
                        </text>
                      )}
                      <text x={t.x + 42} y={fy + ROW_H / 2 + 4} fill={f.pk ? "#fbbf24" : f.fk ? "#93c5fd" : "#e2e8f0"} fontSize={12} fontFamily="monospace" fontWeight={f.pk ? 700 : 400}>
                        {f.name}
                      </text>
                      <text x={t.x + COL_W - 8} y={fy + ROW_H / 2 + 4} textAnchor="end" fill="#64748b" fontSize={10} fontFamily="monospace">
                        {f.type}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          <g>
            <rect x={20} y={svgH - 68} width={340} height={58} rx={6} fill="#1e293b" stroke="#334155" strokeWidth={1} />
            <text x={32} y={svgH - 48} fill="#94a3b8" fontSize={11} fontFamily="monospace" fontWeight={700}>ЛЕГЕНДА</text>
            <text x={32} y={svgH - 30} fill="#fbbf24" fontSize={11} fontFamily="monospace">PK</text>
            <text x={52} y={svgH - 30} fill="#94a3b8" fontSize={11} fontFamily="monospace">— Primary Key</text>
            <text x={32} y={svgH - 14} fill="#60a5fa" fontSize={11} fontFamily="monospace">FK</text>
            <text x={52} y={svgH - 14} fill="#94a3b8" fontSize={11} fontFamily="monospace">— Foreign Key   |—  один   —&lt;  многие</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
