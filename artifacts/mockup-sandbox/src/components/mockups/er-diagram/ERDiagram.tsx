export function ERDiagram() {
  const ROW_H = 26;
  const HEADER_H = 34;
  const COL_W = 320;

  const tables = [
    {
      id: "users",
      label: "users",
      x: 50,
      y: 300,
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
      x: 440,
      y: 50,
      fields: [
        { name: "id", type: "TEXT", pk: true },
        { name: "title", type: "TEXT" },
        { name: "coach_id", type: "INTEGER", fk: true },
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
      x: 440,
      y: 440,
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
      x: 840,
      y: 50,
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "day_of_week", type: "TEXT" },
        { name: "time", type: "TEXT" },
        { name: "section_id", type: "TEXT", fk: true },
        { name: "coach_id", type: "INTEGER" },
      ],
    },
    {
      id: "messages",
      label: "messages",
      x: 840,
      y: 320,
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "sender_id", type: "INTEGER", fk: true },
        { name: "receiver_id", type: "INTEGER", fk: true },
        { name: "text", type: "TEXT" },
        { name: "read", type: "INTEGER" },
        { name: "created_at", type: "TEXT" },
      ],
    },
    {
      id: "attendance",
      label: "attendance",
      x: 840,
      y: 590,
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
      x: 50,
      y: 700,
      fields: [
        { name: "student_id", type: "TEXT", pk: true },
        { name: "first_name", type: "TEXT NOT NULL" },
        { name: "last_name", type: "TEXT NOT NULL" },
        { name: "middle_name", type: "TEXT" },
        { name: "group_name", type: "TEXT" },
      ],
    },
    {
      id: "pending_registrations",
      label: "pending_registrations",
      x: 440,
      y: 700,
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "login", type: "TEXT" },
        { name: "password", type: "TEXT" },
        { name: "last_name", type: "TEXT NOT NULL" },
        { name: "first_name", type: "TEXT NOT NULL" },
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
      x: 1200,
      y: 50,
      fields: [
        { name: "id", type: "INTEGER", pk: true },
        { name: "section_id", type: "TEXT", fk: true },
        { name: "coach_id", type: "INTEGER" },
        { name: "text", type: "TEXT" },
        { name: "created_at", type: "TEXT" },
      ],
    },
  ];

  function tableH(t: (typeof tables)[0]) { return HEADER_H + t.fields.length * ROW_H; }
  function rowCY(t: (typeof tables)[0], fi: number) { return t.y + HEADER_H + fi * ROW_H + ROW_H / 2; }
  function tRight(t: (typeof tables)[0]) { return t.x + COL_W; }
  function tBottom(t: (typeof tables)[0]) { return t.y + tableH(t); }
  function tCX(t: (typeof tables)[0]) { return t.x + COL_W / 2; }

  type Rel = { fromId: string; fromField: string; toId: string; toField: string; label?: string; };

  const relations: Rel[] = [
    { fromId: "sections",      fromField: "coach_id",    toId: "users",    toField: "id" },
    { fromId: "messages",      fromField: "sender_id",   toId: "users",    toField: "id", label: "отправитель" },
    { fromId: "messages",      fromField: "receiver_id", toId: "users",    toField: "id", label: "получатель" },
    { fromId: "schedule",      fromField: "section_id",  toId: "sections", toField: "id" },
    { fromId: "section_posts", fromField: "section_id",  toId: "sections", toField: "id" },
  ];

  function renderRelation(rel: Rel, idx: number) {
    const fT = tables.find(t => t.id === rel.fromId)!;
    const tT = tables.find(t => t.id === rel.toId)!;
    const fFi = fT.fields.findIndex(f => f.name === rel.fromField);
    const tFi = tT.fields.findIndex(f => f.name === rel.toField);
    const fy = rowCY(fT, fFi);
    const ty = rowCY(tT, tFi);

    let x1: number, x2: number;
    let oneX: number, oneY: number, manyX: number, manyY: number;
    let oneAnchor: string, manyAnchor: string;

    if (tRight(fT) <= tT.x) {
      x1 = tRight(fT); x2 = tT.x;
      manyX = x1 + 6; manyY = fy; oneX = x2 - 6; oneY = ty;
      manyAnchor = "start"; oneAnchor = "end";
    } else if (tRight(tT) <= fT.x) {
      x1 = fT.x; x2 = tRight(tT);
      manyX = x1 - 6; manyY = fy; oneX = x2 + 6; oneY = ty;
      manyAnchor = "end"; oneAnchor = "start";
    } else {
      x1 = tRight(fT); x2 = tT.x;
      manyX = x1 + 6; manyY = fy; oneX = x2 - 6; oneY = ty;
      manyAnchor = "start"; oneAnchor = "end";
    }

    const offset = (idx - 2) * 20;
    const mx = (x1 + x2) / 2 + offset;
    const path = `M${x1},${fy} C${mx},${fy} ${mx},${ty} ${x2},${ty}`;
    const labelX = mx;
    const labelY = (fy + ty) / 2;

    return (
      <g key={`${rel.fromId}-${rel.fromField}-${idx}`}>
        <path d={path} fill="none" stroke="#444" strokeWidth={1.4} />

        <text x={manyX} y={manyY - 6} textAnchor={manyAnchor}
          fill="#c0392b" fontSize={13} fontWeight={700}
          fontFamily="'Times New Roman', Times, serif">N</text>

        <text x={oneX} y={oneY - 6} textAnchor={oneAnchor}
          fill="#1a3557" fontSize={13} fontWeight={700}
          fontFamily="'Times New Roman', Times, serif">1</text>

        {rel.label && (
          <text x={labelX} y={labelY - 6} textAnchor="middle"
            fill="#666" fontSize={10} fontStyle="italic"
            fontFamily="'Times New Roman', Times, serif">
            «{rel.label}»
          </text>
        )}
      </g>
    );
  }

  const SVG_W = 1570;
  const SVG_H = 1030;

  return (
    <div style={{
      background: "#fff",
      minHeight: "100vh",
      padding: "24px 28px",
      fontFamily: "'Times New Roman', Times, serif",
      color: "#111",
    }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3 }}>
          Диаграмма «сущность–связь» базы данных веб-приложения КГУ СПОРТ
        </div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          (нотация ER, СУБД SQLite)
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: "block", border: "1px solid #bbb" }}>

          {relations.map((r, i) => renderRelation(r, i))}

          {tables.map(t => {
            const h = tableH(t);
            return (
              <g key={t.id}>
                <rect x={t.x} y={t.y} width={COL_W} height={h}
                  fill="#fff" stroke="#333" strokeWidth={1.5} />

                <rect x={t.x} y={t.y} width={COL_W} height={HEADER_H}
                  fill="#1a3557" />
                <text x={t.x + COL_W / 2} y={t.y + HEADER_H / 2 + 5}
                  textAnchor="middle" fill="#fff"
                  fontSize={13} fontWeight={700}
                  fontFamily="'Times New Roman', Times, serif">
                  {t.label}
                </text>

                <line x1={t.x} y1={t.y + HEADER_H}
                      x2={t.x + COL_W} y2={t.y + HEADER_H}
                      stroke="#333" strokeWidth={1.5} />

                {t.fields.map((f, fi) => {
                  const fy = t.y + HEADER_H + fi * ROW_H;
                  const isLast = fi === t.fields.length - 1;
                  return (
                    <g key={f.name}>
                      {fi % 2 === 1 && (
                        <rect x={t.x + 1} y={fy} width={COL_W - 2} height={ROW_H} fill="#f5f7fa" />
                      )}
                      {!isLast && (
                        <line x1={t.x} y1={fy + ROW_H} x2={t.x + COL_W} y2={fy + ROW_H}
                          stroke="#ccc" strokeWidth={0.8} />
                      )}

                      {f.pk && (
                        <text x={t.x + 10} y={fy + ROW_H / 2 + 4}
                          fill="#b8860b" fontSize={11}
                          fontFamily="'Times New Roman', Times, serif">🔑</text>
                      )}
                      {(f as any).fk && !f.pk && (
                        <text x={t.x + 9} y={fy + ROW_H / 2 + 4}
                          fill="#c0392b" fontSize={10} fontWeight={700}
                          fontFamily="'Times New Roman', Times, serif">FK</text>
                      )}

                      <text
                        x={t.x + (f.pk || (f as any).fk ? 30 : 12)}
                        y={fy + ROW_H / 2 + 4}
                        fill={f.pk ? "#1a3557" : "#111"}
                        fontSize={12}
                        fontStyle={f.pk ? "italic" : "normal"}
                        fontWeight={f.pk ? 700 : 400}
                        textDecoration={f.pk ? "underline" : "none"}
                        fontFamily="'Times New Roman', Times, serif">
                        {f.name}
                      </text>

                      <text x={t.x + COL_W - 6} y={fy + ROW_H / 2 + 4}
                        textAnchor="end" fill="#777" fontSize={10}
                        fontFamily="'Times New Roman', Times, serif">
                        {f.type}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          <rect x={20} y={SVG_H - 68} width={420} height={58}
            fill="#fff" stroke="#333" strokeWidth={1} />
          <text x={30} y={SVG_H - 50} fontSize={11} fontWeight={700}
            fontFamily="'Times New Roman', Times, serif" fill="#111">
            Условные обозначения:
          </text>
          <line x1={30} y1={SVG_H - 30} x2={100} y2={SVG_H - 30} stroke="#444" strokeWidth={1.4} />
          <text x={36} y={SVG_H - 38} fill="#c0392b" fontSize={13} fontWeight={700}
            fontFamily="'Times New Roman', Times, serif">N</text>
          <text x={94} y={SVG_H - 38} fill="#1a3557" fontSize={13} fontWeight={700}
            fontFamily="'Times New Roman', Times, serif">1</text>
          <text x={110} y={SVG_H - 28} fontSize={11}
            fontFamily="'Times New Roman', Times, serif" fill="#111">
            — связь «один ко многим»
          </text>
          <text x={30} y={SVG_H - 13} fontSize={11}
            fontFamily="'Times New Roman', Times, serif">
            <tspan fill="#b8860b">🔑</tspan>
            <tspan fill="#111"> — PK (первичный ключ)    </tspan>
            <tspan fill="#c0392b" fontWeight={700}>FK</tspan>
            <tspan fill="#111"> — внешний ключ</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
