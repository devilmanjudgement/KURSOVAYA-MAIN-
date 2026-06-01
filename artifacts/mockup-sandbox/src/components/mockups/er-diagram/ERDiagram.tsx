export function ERDiagram() {
  const COL_W = 300;
  const ROW_H = 26;
  const HEADER_H = 36;
  const BADGE_W = 28;

  const PURPLE     = "#7c6fcd";
  const PURPLE_DK  = "#5a4fa8";
  const TEAL       = "#3a9e8d";
  const RED_H      = "#b94040";
  const GRAY_H     = "#607080";
  const ROW_ODD    = "#f3f0ff";
  const ROW_EVEN   = "#ffffff";
  const BORDER     = "#c0b8e8";
  const LINE_FK    = "#5a4fa8";
  const LINE_LOG   = "#9a8fd0";

  // ── tables ──────────────────────────────────────────────
  const tables = [
    {
      id: "users", label: "USERS", color: PURPLE,
      x: 530, y: 30,
      fields: [
        { type: "int",    name: "id",          badge: "PK" },
        { type: "string", name: "name",         badge: "" },
        { type: "string", name: "login",        badge: "" },
        { type: "string", name: "password",     badge: "" },
        { type: "string", name: "role",         badge: "" },
        { type: "string", name: "group_name",   badge: "" },
        { type: "string", name: "avatar",       badge: "" },
        { type: "string", name: "health_doc",   badge: "" },
        { type: "string", name: "student_id",   badge: "" },
      ],
    },
    {
      id: "sections", label: "SECTIONS", color: PURPLE,
      x: 90, y: 350,
      fields: [
        { type: "text",   name: "id",           badge: "PK" },
        { type: "string", name: "title",        badge: "" },
        { type: "int",    name: "coach_id",     badge: "FK" },
        { type: "string", name: "place",        badge: "" },
        { type: "string", name: "color",        badge: "" },
        { type: "string", name: "image",        badge: "" },
        { type: "text",   name: "description",  badge: "" },
        { type: "int",    name: "max_students", badge: "" },
      ],
    },
    {
      id: "schedule", label: "SCHEDULE", color: PURPLE,
      x: 530, y: 450,
      fields: [
        { type: "int",    name: "id",           badge: "PK" },
        { type: "string", name: "day_of_week",  badge: "" },
        { type: "time",   name: "time",         badge: "" },
        { type: "text",   name: "section_id",   badge: "FK" },
        { type: "int",    name: "coach_id",     badge: "FK" },
      ],
    },
    {
      id: "bookings", label: "BOOKINGS", color: PURPLE,
      x: 90, y: 680,
      fields: [
        { type: "int",    name: "bookingId",    badge: "PK" },
        { type: "text",   name: "sectionId",    badge: "FK*" },
        { type: "string", name: "user",         badge: "" },
        { type: "date",   name: "date",         badge: "" },
        { type: "string", name: "docType",      badge: "" },
        { type: "string", name: "status",       badge: "" },
      ],
    },
    {
      id: "messages", label: "MESSAGES", color: TEAL,
      x: 970, y: 100,
      fields: [
        { type: "int",    name: "id",           badge: "PK" },
        { type: "int",    name: "sender_id",    badge: "FK" },
        { type: "int",    name: "receiver_id",  badge: "FK" },
        { type: "text",   name: "text",         badge: "" },
        { type: "int",    name: "read",         badge: "" },
        { type: "string", name: "created_at",   badge: "" },
      ],
    },
    {
      id: "section_posts", label: "SECTION_POSTS", color: TEAL,
      x: 970, y: 430,
      fields: [
        { type: "int",    name: "id",           badge: "PK" },
        { type: "text",   name: "section_id",   badge: "FK" },
        { type: "int",    name: "coach_id",     badge: "" },
        { type: "text",   name: "text",         badge: "" },
        { type: "string", name: "created_at",   badge: "" },
      ],
    },
    {
      id: "attendance", label: "ATTENDANCE", color: GRAY_H,
      x: 970, y: 700,
      fields: [
        { type: "int",    name: "id",           badge: "PK" },
        { type: "string", name: "student_name", badge: "" },
        { type: "text",   name: "section_id",   badge: "" },
        { type: "string", name: "section_title",badge: "" },
        { type: "int",    name: "coach_id",     badge: "" },
        { type: "date",   name: "date",         badge: "" },
        { type: "int",    name: "present",      badge: "" },
      ],
    },
    {
      id: "student_registry", label: "STUDENT_REGISTRY", color: GRAY_H,
      x: 90, y: 960,
      fields: [
        { type: "text",   name: "student_id",   badge: "PK" },
        { type: "string", name: "first_name",   badge: "" },
        { type: "string", name: "last_name",    badge: "" },
        { type: "string", name: "middle_name",  badge: "" },
        { type: "string", name: "group_name",   badge: "" },
      ],
    },
    {
      id: "pending_registrations", label: "PENDING_REGISTRATIONS", color: RED_H,
      x: 530, y: 760,
      fields: [
        { type: "int",    name: "id",              badge: "PK" },
        { type: "string", name: "login",           badge: "" },
        { type: "string", name: "last_name",       badge: "" },
        { type: "string", name: "first_name",      badge: "" },
        { type: "string", name: "student_id",      badge: "" },
        { type: "string", name: "email",           badge: "" },
        { type: "string", name: "status",          badge: "" },
        { type: "string", name: "rejection_reason",badge: "" },
        { type: "string", name: "created_at",      badge: "" },
      ],
    },
  ] as const;

  type TableDef = (typeof tables)[number];

  function tH(t: TableDef) { return HEADER_H + t.fields.length * ROW_H; }
  function tRight(t: TableDef) { return t.x + COL_W; }
  function tBottom(t: TableDef) { return t.y + tH(t); }
  function tCX(t: TableDef) { return t.x + COL_W / 2; }
  function tCY(t: TableDef) { return t.y + tH(t) / 2; }
  function fieldY(t: TableDef, fi: number) { return t.y + HEADER_H + fi * ROW_H + ROW_H / 2; }
  function tById(id: string) { return tables.find(t => t.id === id)!; }
  function fieldIdx(t: TableDef, name: string) { return t.fields.findIndex((f: any) => f.name === name); }

  // ── relations ────────────────────────────────────────────
  // fromSide/toSide: which edge of the table the line exits/enters
  const relations = [
    {
      from: "sections",      fromField: "coach_id",
      to:   "users",         toField:   "id",
      label: "1 преподаватель → N секций",
      dashed: false,
      path: "top-bottom",
    },
    {
      from: "schedule",      fromField: "coach_id",
      to:   "users",         toField:   "id",
      label: "1 преподаватель → N расписаний",
      dashed: false,
      path: "top-bottom",
    },
    {
      from: "schedule",      fromField: "section_id",
      to:   "sections",      toField:   "id",
      label: "1 секция → N расписаний",
      dashed: false,
      path: "left-right",
    },
    {
      from: "messages",      fromField: "sender_id",
      to:   "users",         toField:   "id",
      label: "отправитель",
      dashed: false,
      path: "left-right",
    },
    {
      from: "messages",      fromField: "receiver_id",
      to:   "users",         toField:   "id",
      label: "получатель",
      dashed: false,
      path: "left-right",
    },
    {
      from: "section_posts", fromField: "section_id",
      to:   "sections",      toField:   "id",
      label: "1 секция → N объявлений",
      dashed: false,
      path: "left-right",
    },
    {
      from: "bookings",      fromField: "sectionId",
      to:   "sections",      toField:   "id",
      label: "1 секция → N заявок",
      dashed: true,
      path: "top-bottom",
    },
  ];

  function renderRelation(rel: (typeof relations)[number], idx: number) {
    const fT = tById(rel.from);
    const tT = tById(rel.to);
    const fFi = fieldIdx(fT, rel.fromField);
    const tFi = fieldIdx(tT, rel.toField);
    const fy = fieldY(fT, fFi);
    const ty = fieldY(tT, tFi);
    const color = rel.dashed ? LINE_LOG : LINE_FK;
    const stroke = rel.dashed ? "6,4" : "none";

    let x1: number, y1: number, x2: number, y2: number;
    let d: string;
    const offset = (idx - 3) * 12;

    if (rel.path === "left-right") {
      // from right edge of FK table → left edge of PK table (or vice versa)
      if (tRight(fT) < tT.x) {
        x1 = tRight(fT); y1 = fy;
        x2 = tT.x;       y2 = ty;
      } else {
        x1 = fT.x;       y1 = fy;
        x2 = tRight(tT); y2 = ty;
      }
      const mx = (x1 + x2) / 2 + offset;
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    } else {
      // top-bottom: from top/bottom of FK table → top/bottom of PK table
      if (fT.y > tT.y) {
        x1 = tCX(fT); y1 = fT.y;
        x2 = tCX(tT); y2 = tBottom(tT);
      } else {
        x1 = tCX(fT); y1 = tBottom(fT);
        x2 = tCX(tT); y2 = tT.y;
      }
      const my = (y1 + y2) / 2 + offset;
      d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
    }

    // midpoint for label
    const lx = (x1 + x2) / 2;
    const ly = (y1 + y2) / 2;
    const labelW = rel.label.length * 6.2 + 16;

    return (
      <g key={idx}>
        <path d={d} fill="none" stroke={color} strokeWidth={1.5}
          strokeDasharray={stroke} />
        {/* circle on FK side */}
        <circle cx={x1} cy={y1} r={4} fill={color} />
        {/* arrow on PK side */}
        {(() => {
          const ang = Math.atan2(y2 - y1, x2 - x1);
          const s = 7;
          const ax = x2 - s * 1.5 * Math.cos(ang);
          const ay = y2 - s * 1.5 * Math.sin(ang);
          const bx = ax - s * Math.sin(ang);
          const by = ay + s * Math.cos(ang);
          const cx2 = ax + s * Math.sin(ang);
          const cy2 = ay - s * Math.cos(ang);
          return <polygon points={`${x2},${y2} ${bx},${by} ${cx2},${cy2}`} fill={color} />;
        })()}
        {/* label */}
        <rect x={lx - labelW / 2} y={ly - 10} width={labelW} height={18}
          rx={4} fill="#f0eeff" stroke={BORDER} strokeWidth={0.8} />
        <text x={lx} y={ly + 4} textAnchor="middle"
          fill="#3d3580" fontSize={9} fontFamily="Arial, sans-serif">
          {rel.label}
        </text>
      </g>
    );
  }

  const SVG_W = 1340;
  const SVG_H = 1280;

  return (
    <div style={{
      background: "#faf9ff",
      minHeight: "100vh",
      padding: "22px 26px",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#3d3580" }}>
          Диаграмма «сущность–связь» базы данных веб-приложения КГУ СПОРТ
        </div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>
          СУБД SQLite · kgusport.db · 9 таблиц
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:20, justifyContent:"center", marginBottom:14, fontSize:11, color:"#555" }}>
        {[
          { color: PURPLE, label: "Основные таблицы" },
          { color: TEAL,   label: "Коммуникации" },
          { color: RED_H,  label: "Регистрация" },
          { color: GRAY_H, label: "Вспомогательные" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ display:"inline-block", width:14, height:14, borderRadius:3, background:color }} />
            {label}
          </span>
        ))}
        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
          <svg width={36} height={12}>
            <line x1={0} y1={6} x2={30} y2={6} stroke={LINE_FK} strokeWidth={1.5} />
            <circle cx={4} cy={6} r={3} fill={LINE_FK} />
            <polygon points="30,6 23,3 23,9" fill={LINE_FK} />
          </svg>
          FK-связь
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:5 }}>
          <svg width={36} height={12}>
            <line x1={0} y1={6} x2={30} y2={6} stroke={LINE_LOG} strokeWidth={1.5} strokeDasharray="5,3" />
            <circle cx={4} cy={6} r={3} fill={LINE_LOG} />
            <polygon points="30,6 23,3 23,9" fill={LINE_LOG} />
          </svg>
          Логическая связь
        </span>
      </div>

      <div style={{ overflowX:"auto", overflowY:"auto" }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display:"block", background:"#fff", border:"1px solid #d0c8f0", borderRadius:8 }}>

          {relations.map((r, i) => renderRelation(r, i))}

          {tables.map(t => {
            const h = tH(t);
            return (
              <g key={t.id}>
                <rect x={t.x} y={t.y} width={COL_W} height={h}
                  rx={6} fill="#fff" stroke={BORDER} strokeWidth={1.5} />
                {/* header */}
                <rect x={t.x} y={t.y} width={COL_W} height={HEADER_H}
                  rx={6} fill={t.color} />
                <rect x={t.x} y={t.y + HEADER_H - 8} width={COL_W} height={8} fill={t.color} />
                <text x={t.x + COL_W / 2} y={t.y + HEADER_H / 2 + 6}
                  textAnchor="middle" fill="#fff"
                  fontSize={t.label.length > 16 ? 11 : 13} fontWeight={700}
                  fontFamily="Arial, sans-serif" letterSpacing={0.5}>
                  {t.label}
                </text>
                {/* rows */}
                {t.fields.map((f, fi) => {
                  const fy = t.y + HEADER_H + fi * ROW_H;
                  const isLast = fi === t.fields.length - 1;
                  const bg = fi % 2 === 0 ? ROW_ODD : ROW_EVEN;
                  const badge = (f as any).badge as string;
                  const isFkStar = badge === "FK*";
                  const badgeColor = badge === "PK" ? t.color
                    : isFkStar ? "#9a8fd0"
                    : "#c0392b";
                  return (
                    <g key={f.name}>
                      <rect x={t.x + 1} y={fy} width={COL_W - 2} height={ROW_H} fill={bg} />
                      {!isLast && (
                        <line x1={t.x} y1={fy + ROW_H} x2={t.x + COL_W} y2={fy + ROW_H}
                          stroke={BORDER} strokeWidth={0.7} />
                      )}
                      {/* type */}
                      <text x={t.x + 8} y={fy + ROW_H / 2 + 5}
                        fill="#9080c0" fontSize={10} fontFamily="Arial, sans-serif">
                        {f.type}
                      </text>
                      {/* name */}
                      <text x={t.x + 74} y={fy + ROW_H / 2 + 5}
                        fill={badge ? PURPLE_DK : "#333"}
                        fontSize={11} fontWeight={badge ? 600 : 400}
                        fontFamily="Arial, sans-serif">
                        {f.name}
                      </text>
                      {/* badge */}
                      {badge && (
                        <>
                          <rect x={t.x + COL_W - BADGE_W - 5} y={fy + ROW_H / 2 - 9}
                            width={BADGE_W + (isFkStar ? 4 : 0)} height={18} rx={4} fill={badgeColor} />
                          <text x={t.x + COL_W - BADGE_W / 2 - 5 + (isFkStar ? 2 : 0)}
                            y={fy + ROW_H / 2 + 5}
                            textAnchor="middle" fill="#fff"
                            fontSize={9} fontWeight={700} fontFamily="Arial, sans-serif">
                            {badge}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
                {/* border overlay (for rounded corners) */}
                <rect x={t.x} y={t.y} width={COL_W} height={h}
                  rx={6} fill="none" stroke={BORDER} strokeWidth={1.5} />
              </g>
            );
          })}

          {/* FK* note */}
          <text x={10} y={SVG_H - 8} fontSize={9} fill="#9a8fd0" fontFamily="Arial, sans-serif">
            * FK* — логическая связь (поле содержит id секции, формальный FOREIGN KEY в схеме не объявлен)
          </text>
        </svg>
      </div>
    </div>
  );
}
