export function ERDiagram() {
  const COL_W = 310;
  const ROW_H = 28;
  const HEADER_H = 38;
  const BADGE_W = 28;

  const PURPLE = "#7c6fcd";
  const PURPLE_DARK = "#5a4fa8";
  const ROW_ODD = "#f3f0ff";
  const ROW_EVEN = "#ffffff";
  const BORDER = "#b8b0e0";
  const LINE = "#5a4fa8";
  const LABEL_BG = "#f0eeff";

  const tables = [
    {
      id: "USERS",
      x: 330,
      y: 30,
      fields: [
        { type: "int",    name: "id",          badge: "PK" },
        { type: "string", name: "name",         badge: "" },
        { type: "string", name: "login",        badge: "" },
        { type: "string", name: "password",     badge: "" },
        { type: "string", name: "role",         badge: "" },
        { type: "string", name: "group_name",   badge: "" },
        { type: "string", name: "avatar",       badge: "" },
        { type: "string", name: "health_doc",   badge: "" },
      ],
    },
    {
      id: "SECTIONS",
      x: 30,
      y: 350,
      fields: [
        { type: "int",    name: "id",           badge: "PK" },
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
      id: "BOOKINGS",
      x: 30,
      y: 720,
      fields: [
        { type: "int",    name: "bookingId",    badge: "PK" },
        { type: "int",    name: "sectionId",    badge: "FK" },
        { type: "string", name: "user",         badge: "" },
        { type: "date",   name: "date",         badge: "" },
        { type: "string", name: "docType",      badge: "" },
        { type: "string", name: "status",       badge: "" },
      ],
    },
    {
      id: "SCHEDULE",
      x: 630,
      y: 350,
      fields: [
        { type: "int",    name: "id",           badge: "PK" },
        { type: "string", name: "day_of_week",  badge: "" },
        { type: "time",   name: "time",         badge: "" },
        { type: "int",    name: "section_id",   badge: "FK" },
        { type: "int",    name: "coach_id",     badge: "FK" },
      ],
    },
  ];

  function tH(t: (typeof tables)[0]) { return HEADER_H + t.fields.length * ROW_H; }
  function tRight(t: (typeof tables)[0]) { return t.x + COL_W; }
  function tBottom(t: (typeof tables)[0]) { return t.y + tH(t); }
  function tCX(t: (typeof tables)[0]) { return t.x + COL_W / 2; }
  function tCY(t: (typeof tables)[0]) { return t.y + tH(t) / 2; }
  function fieldY(t: (typeof tables)[0], fi: number) { return t.y + HEADER_H + fi * ROW_H + ROW_H / 2; }

  function tById(id: string) { return tables.find(t => t.id === id)!; }
  function fieldIdx(t: (typeof tables)[0], name: string) { return t.fields.findIndex(f => f.name === name); }

  // Relations: from FK field → to PK field, with label
  const relations = [
    {
      from: "SECTIONS", fromField: "coach_id",
      to: "USERS", toField: "id",
      label: "Один ко многим\n(1 преподаватель → N секций)",
      fromSide: "top", toSide: "bottom",
    },
    {
      from: "SCHEDULE", fromField: "coach_id",
      to: "USERS", toField: "id",
      label: "Один ко многим\n(1 преподаватель → N записей расписания)",
      fromSide: "top", toSide: "right",
    },
    {
      from: "BOOKINGS", fromField: "sectionId",
      to: "SECTIONS", toField: "id",
      label: "Один ко многим\n(1 секция → N заявок)",
      fromSide: "top", toSide: "bottom",
    },
    {
      from: "SCHEDULE", fromField: "section_id",
      to: "SECTIONS", toField: "id",
      label: "Один ко многим\n(1 секция → N записей расписания)",
      fromSide: "left", toSide: "right",
    },
  ];

  function edgePoint(t: (typeof tables)[0], side: string, fi?: number): [number, number] {
    if (side === "top")    return [tCX(t), t.y];
    if (side === "bottom") return [tCX(t), tBottom(t)];
    if (side === "left")   return [t.x, fi !== undefined ? fieldY(t, fi) : tCY(t)];
    if (side === "right")  return [tRight(t), fi !== undefined ? fieldY(t, fi) : tCY(t)];
    return [tCX(t), tCY(t)];
  }

  function Arrow({ x, y, dir }: { x: number; y: number; dir: "up"|"down"|"left"|"right" }) {
    const s = 7;
    const pts: Record<string, string> = {
      up:    `${x},${y} ${x - s},${y + s * 1.5} ${x + s},${y + s * 1.5}`,
      down:  `${x},${y} ${x - s},${y - s * 1.5} ${x + s},${y - s * 1.5}`,
      left:  `${x},${y} ${x + s * 1.5},${y - s} ${x + s * 1.5},${y + s}`,
      right: `${x},${y} ${x - s * 1.5},${y - s} ${x - s * 1.5},${y + s}`,
    };
    return <polygon points={pts[dir]} fill={LINE} />;
  }

  function Circle({ x, y }: { x: number; y: number }) {
    return <circle cx={x} cy={y} r={5} fill={PURPLE} stroke={LINE} strokeWidth={1.5} />;
  }

  function renderRelation(rel: (typeof relations)[0], i: number) {
    const fT = tById(rel.from);
    const tT = tById(rel.to);
    const fFi = fieldIdx(fT, rel.fromField);
    const tFi = fieldIdx(tT, rel.toField);
    const [x1, y1] = edgePoint(fT, rel.fromSide, fFi);
    const [x2, y2] = edgePoint(tT, rel.toSide, tFi);

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    const arrowDir: Record<string, "up"|"down"|"left"|"right"> = {
      top: "up", bottom: "down", left: "left", right: "right"
    };

    const lines = rel.label.split("\n");
    const labelW = Math.max(...lines.map(l => l.length)) * 6.5 + 20;
    const labelH = lines.length * 16 + 12;

    let path = `M${x1},${y1} `;
    if (rel.fromSide === "top" && rel.toSide === "bottom") {
      path += `L${x1},${my} L${x2},${my} L${x2},${y2}`;
    } else if (rel.fromSide === "top" && rel.toSide === "right") {
      path += `L${x1},${y2} L${x2},${y2}`;
    } else if (rel.fromSide === "left" && rel.toSide === "right") {
      path += `L${mx},${y1} L${mx},${y2} L${x2},${y2}`;
    } else {
      path += `C${x1},${my} ${x2},${my} ${x2},${y2}`;
    }

    const lx = (rel.fromSide === "left" && rel.toSide === "right")
      ? mx - labelW / 2
      : Math.min(x1, x2) + Math.abs(x2 - x1) * 0.25;
    const ly = my - labelH / 2;

    return (
      <g key={i}>
        <path d={path} fill="none" stroke={LINE} strokeWidth={1.5}
          strokeDasharray="6,3" />
        <Circle x={x1} y={y1} />
        <Arrow x={x2} y={y2} dir={arrowDir[rel.toSide]} />

        <rect x={lx} y={ly} width={labelW} height={labelH}
          rx={5} fill={LABEL_BG} stroke={BORDER} strokeWidth={1} />
        {lines.map((line, li) => (
          <text key={li} x={lx + labelW / 2} y={ly + 14 + li * 16}
            textAnchor="middle" fill="#3d3580" fontSize={10}
            fontFamily="Arial, sans-serif">
            {line}
          </text>
        ))}
      </g>
    );
  }

  const SVG_W = 990;
  const SVG_H = 980;

  return (
    <div style={{
      background: "#faf9ff",
      minHeight: "100vh",
      padding: "28px 32px",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: "#3d3580", letterSpacing: 0.5
        }}>
          Диаграмма «сущность–связь» — база данных КГУ СПОРТ
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          Нотация ER · СУБД SQLite
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ background: "#fff", border: "1px solid #d0c8f0", borderRadius: 8 }}>

          {relations.map((r, i) => renderRelation(r, i))}

          {tables.map(t => {
            const h = tH(t);
            return (
              <g key={t.id}>
                <rect x={t.x} y={t.y} width={COL_W} height={h}
                  rx={6} fill="#fff" stroke={BORDER} strokeWidth={1.5} />

                <rect x={t.x} y={t.y} width={COL_W} height={HEADER_H}
                  rx={6} fill={PURPLE} />
                <rect x={t.x} y={t.y + HEADER_H - 8} width={COL_W} height={8} fill={PURPLE} />
                <text x={t.x + COL_W / 2} y={t.y + HEADER_H / 2 + 6}
                  textAnchor="middle" fill="#fff"
                  fontSize={14} fontWeight={700} fontFamily="Arial, sans-serif" letterSpacing={1}>
                  {t.id}
                </text>

                {t.fields.map((f, fi) => {
                  const fy = t.y + HEADER_H + fi * ROW_H;
                  const isLast = fi === t.fields.length - 1;
                  const bg = fi % 2 === 0 ? ROW_ODD : ROW_EVEN;
                  const isLR = isLast;
                  return (
                    <g key={f.name}>
                      <rect x={t.x + 1} y={fy} width={COL_W - 2}
                        height={ROW_H} fill={bg}
                        rx={isLR ? 0 : 0}
                      />
                      {!isLast && (
                        <line x1={t.x} y1={fy + ROW_H} x2={t.x + COL_W} y2={fy + ROW_H}
                          stroke={BORDER} strokeWidth={0.8} />
                      )}

                      <text x={t.x + 10} y={fy + ROW_H / 2 + 5}
                        fill="#8b7dc0" fontSize={11} fontFamily="Arial, sans-serif">
                        {f.type}
                      </text>

                      <text x={t.x + 80} y={fy + ROW_H / 2 + 5}
                        fill={f.badge === "PK" ? PURPLE_DARK : f.badge === "FK" ? "#c0392b" : "#333"}
                        fontSize={12}
                        fontWeight={f.badge ? 600 : 400}
                        fontFamily="Arial, sans-serif">
                        {f.name}
                      </text>

                      {f.badge && (
                        <>
                          <rect
                            x={t.x + COL_W - BADGE_W - 6}
                            y={fy + ROW_H / 2 - 9}
                            width={BADGE_W} height={18} rx={4}
                            fill={f.badge === "PK" ? PURPLE : "#e74c3c"}
                          />
                          <text
                            x={t.x + COL_W - BADGE_W / 2 - 6}
                            y={fy + ROW_H / 2 + 5}
                            textAnchor="middle"
                            fill="#fff" fontSize={10} fontWeight={700}
                            fontFamily="Arial, sans-serif">
                            {f.badge}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}

                {/* bottom rounded corners clip */}
                <rect x={t.x} y={tBottom(t) - 8} width={COL_W} height={8}
                  fill={t.fields.length % 2 === 0 ? ROW_EVEN : ROW_ODD} />
                <rect x={t.x} y={t.y} width={COL_W} height={h}
                  rx={6} fill="none" stroke={BORDER} strokeWidth={1.5} />
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{
        marginTop: 16, display: "flex", gap: 24, justifyContent: "center",
        fontSize: 12, color: "#666"
      }}>
        <span>
          <span style={{
            display: "inline-block", background: PURPLE, color: "#fff",
            borderRadius: 4, padding: "1px 6px", fontWeight: 700, fontSize: 11, marginRight: 4
          }}>PK</span>
          Первичный ключ
        </span>
        <span>
          <span style={{
            display: "inline-block", background: "#e74c3c", color: "#fff",
            borderRadius: 4, padding: "1px 6px", fontWeight: 700, fontSize: 11, marginRight: 4
          }}>FK</span>
          Внешний ключ
        </span>
        <span>
          <svg width={40} height={16} style={{ verticalAlign: "middle", marginRight: 4 }}>
            <line x1={0} y1={8} x2={28} y2={8} stroke={LINE} strokeWidth={1.5} strokeDasharray="5,3" />
            <circle cx={4} cy={8} r={4} fill={PURPLE} />
            <polygon points="36,8 28,4 28,12" fill={LINE} />
          </svg>
          Один ко многим (1→N)
        </span>
      </div>
    </div>
  );
}
