/* =========================================================
   GRASP / 24 — plan data and interactions
   ========================================================= */

const PHASES = [
  {
    id: 1,
    code: "M01",
    cn: "基线",
    name: "BASELINE",
    title: "工程、坐标与感知",
    weeks: "第 1–4 周",
    startWeek: 1,
    endWeek: 4,
    color: "#1d5b5b",
    goal: "把坐标、标定、感知与安全基线做扎实，形成可复现的数据和报告。",
    gates: [
      "外参平均误差 ≤3mm，最大 ≤6mm，P95 ≤5mm",
      "数据集 ≥180 帧，字段完整率 100%",
      "单圆柱检测 ≥95%，多物体目标选取 ≥90%",
      "中心重复定位标准差 ≤2mm"
    ],
    fallback: "外参或检测未过：先用 1 周补救，只补最弱一项；不带病进入真机。"
  },
  {
    id: 2,
    code: "M02",
    cn: "离线",
    name: "OFFLINE LOOP",
    title: "规划、碰撞与状态机",
    weeks: "第 5–8 周",
    startWeek: 5,
    endWeek: 8,
    color: "#2d4d6e",
    goal: "在仿真里把抓取评分、碰撞检测和完整状态机跑通，为零风险上真机做准备。",
    gates: [
      "仿真 100 次抓取成功率 ≥95%",
      "无自碰撞 / 场景碰撞，碰撞体齐全",
      "14 状态均有超时、错误码、日志",
      "Top-3 抓取候选在 50 场景稳定可用"
    ],
    fallback: "ROS 2 环境受阻：保留 Windows 离线链路完成评分与状态机；真机前必须补碰撞验证。"
  },
  {
    id: 3,
    code: "M03",
    cn: "单臂",
    name: "SINGLE ARM",
    title: "真实抓取闭环",
    weeks: "第 9–12 周",
    startWeek: 9,
    endWeek: 12,
    color: "#bf4618",
    goal: "用 100 次真实实验证明单臂抓取稳定，用结果决定能否进入双臂阶段。",
    gates: [
      "检测 ≥95%，目标可规划率 ≥95%",
      "固定抓取 ≥95%，随机抓取 ≥90%",
      "放置 ≥90%，100 次无碰撞 / 保护停止",
      "重复定位标准差 ≤2–3mm，失败可安全回退"
    ],
    fallback: "未达门槛：最多补 2 周；双臂阶段降级为独立任务 + 交接，不做共同搬运。"
  },
  {
    id: 4,
    code: "M04",
    cn: "双臂",
    name: "DUAL ARM",
    title: "共享世界与交接",
    weeks: "第 13–16 周",
    startWeek: 13,
    endWeek: 16,
    color: "#5d642d",
    goal: "两台机器人共享世界模型，先完成独立协同，再做可验证的交接。",
    gates: [
      "共享工作区点位误差 ≤5mm",
      "双臂同时规划，交叉碰撞检测有效",
      "30 次交接成功率 ≥85%",
      "任一臂故障，另一臂安全停"
    ],
    fallback: "共享点误差 >5mm 或频繁互碰：退回分区作业，暂不交接。"
  },
  {
    id: 5,
    code: "M05",
    cn: "闭链",
    name: "CLOSED CHAIN",
    title: "仿真与低速共同搬运",
    weeks: "第 17–20 周",
    startWeek: 17,
    endWeek: 20,
    color: "#6c4058",
    goal: "理解闭链约束，在仿真和真机上完成低速、轻载的共同搬运。",
    gates: [
      "仿真相对位置误差 ≤5mm，姿态 ≤2°",
      "30 组同步测试无失控 / 超时堆积",
      "真实 50mm / 200mm 搬运成功率 ≥80%",
      "最小避碰距离 ≥ 设定安全阈值"
    ],
    fallback: "没有六维力传感器：只做轻质、低刚度物体与短距离；否则停在仿真 + 交接。"
  },
  {
    id: 6,
    code: "M06",
    cn: "验收",
    name: "VALIDATION",
    title: "力控、故障与最终实验",
    weeks: "第 21–24 周",
    startWeek: 21,
    endWeek: 24,
    color: "#3a4b50",
    goal: "补上顺应与安全，完成四组最终实验，把半年证据链整理成可复现的交付。",
    gates: [
      "四组最终实验各 50 次达到目标",
      "10 类故障全部安全停且可复盘",
      "文档、代码、数据、视频、报告齐全",
      "完成一次干净环境复现启动"
    ],
    fallback: "时间不足：优先保留单臂 + 交接的完整证据链，共同搬运作为扩展结果呈现。"
  }
];

const WEEK_META = [
  { title: "冻结安全架构", focus: "保留旧程序，新建抓取入口；先让“不许动”成为默认。", min: "五种运行模式 + 默认禁运动 + 完整坐标树。", output: "架构图 v0.1、风险清单、配置模板、硬件信息表。" },
  { title: "外参空间验证", focus: "不看软件残差，用独立点位验证相机到基座的真实误差。", min: "至少 15 个独立验证点，输出 XYZ 与欧氏误差。", output: "外参验证报告 v1，含平均值、最大值与 P95。" },
  { title: "真实圆柱数据集", focus: "先让数据可复现，再谈算法鲁棒性。", min: "至少 180 帧，字段完整，覆盖直/横/斜与遮挡。", output: "数据集 v1、采集说明与标注规范。" },
  { title: "位姿稳定性与月验收", focus: "把失败分型，用参数扫描而不是加模型解决稳定性。", min: "单圆柱检测 ≥95%，中心重复性标准差 ≤2mm。", output: "月 1 报告、算法配置冻结版、G1 验收记录。" },

  { title: "抓手、TCP 与候选", focus: "把抓手当成系统的一部分，而不是一个开关。", min: "TCP、负载、碰撞包络与三类抓取候选全部落地。", output: "工具模型、抓取候选生成器、参数表。" },
  { title: "抓取评分与可达性", focus: "先用规则评分，把“能抓”与“抓得好”分开。", min: "评分器可解释，Top-3 策略在 50 个场景复评。", output: "评分报告、主抓取策略决策记录。" },
  { title: "ROS 2 + MoveIt 2", focus: "把 Windows 感知链与 Ubuntu 规划链解耦，先跑通虚拟 M1013。", min: "虚拟机械臂可规划到目标位姿，场景含桌面/相机/圆柱。", output: "可复现启动脚本、URDF/SRDF、规划演示。" },
  { title: "状态机与月验收", focus: "用状态机管理失败，而不是靠操作员盯屏幕。", min: "14 状态全链路 + 超时/错误码/日志；仿真 100 次。", output: "状态机 v1、月 2 报告、真机前检查表。" },

  { title: "分级真机空载", focus: "从“不动机器人”逐级过渡到“完整空循环”，每一级都能回退。", min: "6 级空载演练通过，速度限制在额定 5–10%。", output: "安全评审记录、空载 30 次日志。" },
  { title: "单圆柱真实抓取", focus: "固定一个最简单的工况，建立第一份真实成功率基线。", min: "50 次实验，视觉/规划/抓取/放置四阶段指标齐全。", output: "单工况基线报告、失败分类表。" },
  { title: "单变量随机化", focus: "每次只增加一个变量，确保失败可以归因。", min: "位置、旋转、尺寸、姿态、多物体逐项验证。", output: "随机化实验矩阵、失败帕累托图。" },
  { title: "单臂 100 次验收", focus: "用数据决定是否进入双臂，而不是用时间表决定。", min: "抓取 ≥90%、放置 ≥90%、无碰撞/保护停止。", output: "单臂验收报告、进入双臂的决策记录。" },

  { title: "统一世界系", focus: "两台机器人先共享坐标，才谈共享任务。", min: "三组外参 + 共享点误差 ≤5mm。", output: "world 标定报告、一致性检查脚本。" },
  { title: "双臂 MoveIt 模型", focus: "命名空间、TF、控制器全部隔离，碰撞检测覆盖双臂。", min: "arm1 / arm2 / both_arms 可规划，互碰可检测。", output: "双臂 Xacro/SRDF、仿真场景、启动脚本。" },
  { title: "独立任务协同", focus: "先松耦合：各干各的，但共享区域必须互斥。", min: "共享区互斥 + 失败联动 + 30 组稳定运行。", output: "调度模块、协同实验记录。" },
  { title: "交接任务", focus: "交接的关键是“确认接稳”，不是“同时松手”。", min: "30 次交接 ≥85%，任一步超时可安全退出。", output: "交接流程 v1、月 4 报告、G4 验收记录。" },

  { title: "闭链运动学", focus: "共同抓持不是两条轨迹，而是一组相对位姿约束。", min: "能计算两 TCP 相对误差，跑通最小闭链数值实验。", output: "约束推导笔记、闭链仿真 demo。" },
  { title: "仿真共同搬运", focus: "先在仿真里让 leader–follower 稳定，再碰真机。", min: "直线 + 小角度旋转 + 绕障；30 组仿真。", output: "共同搬运仿真、指标报告。" },
  { title: "轨迹同步", focus: "同步是时间、状态和故障处理的组合，不是同时发命令。", min: "启动屏障、心跳、超时双停、进度监测全部验证。", output: "同步模块、延迟注入测试记录。" },
  { title: "低速真实共同搬运", focus: "逐级加载：空载→各持物→接触→轻抬→短移→长移→旋转。", min: "50/200mm 搬运并放回，成功率 ≥80%。", output: "真机共同搬运报告、月 5 验收记录。" },

  { title: "顺应性与力", focus: "没有力传感器也能做顺应，但要更保守。", min: "完成力零点/限幅或柔性方案；20 次低速实验。", output: "力控/顺应配置、最大力与滑移记录。" },
  { title: "故障注入", focus: "主动制造故障，验证系统会安全地失败。", min: "10 类故障全部安全停、有错误码、可复盘。", output: "故障矩阵、高危项修复清单。" },
  { title: "最终实验", focus: "四组各 50 次，按事先冻结的口径统计。", min: "四组达到目标；输出完整指标与失败分布。", output: "最终实验数据集、统计表、图表。" },
  { title: "收尾与复盘", focus: "把半年的证据链整理成别人可复现的交付物。", min: "文档、代码、数据、视频、报告齐全。", output: "半年报告/论文初稿、演示视频、下一阶段目标。" }
];

/* Each week: 7 days (Mon–Sun), each day: 1–3 concrete tasks. */
const DAY_PLAN = [
  [
    ["回读旧 DRFL 程序与圆柱位姿工程，按“可直接复用 / 必须隔离 / 有风险”三类做标记。", "写下 3 条安全红线：默认不运动、无日志不执行、急停后不自动恢复。"],
    ["建立新的抓取工程骨架：配置加载、日志、模式枚举、依赖清单。", "把旧程序原样封存，新入口默认进入 OFFLINE。"],
    ["实现五种运行模式与执行权限状态机，所有运动/IO 命令统一经过权限门。", "为拒绝执行的情况定义明确错误码。"],
    ["画坐标树 world→robot1_base→flange→tcp→camera→object，写明单位与矩阵方向。", "列一张“谁提供、谁消费、谁校验”的坐标变换表。"],
    ["加入启动自检：相机、机器人、抓手、配置文件逐项检查并按等级报错。", "准备三种配置：离线、仿真、真机，默认只读。"],
    ["不连接机器人演练启动、模式切换、权限拒绝，并保存日志。", "补全硬件信息表：抓手型号/开口、工具重量、第二臂型号、力传感器、相机安装。", "整理风险清单，标出第 2 周前必须确认的项。"],
    ["1h 周复盘：冻结架构图 v0.1，列待确认项与下周唯一核心目标。"]
  ],
  [
    ["设计 18 个验证点：覆盖远/近、高/低、视野中心/边缘，并编号贴标。", "确定记录表字段：相机坐标、变换后 base、机器人实测、XYZ 误差。"],
    ["制作针尖或标定球工装，固定相机支架；记录安装状态与初始温度。", "把“参与标定”和“独立验证”的点分成两组。"],
    ["采集前 8 个验证点，逐点用机器人实测；检查矩阵方向是否一致。", "对同一点重复测 3 次，开始积累重复性数据。"],
    ["采集剩余 10 个点，覆盖边缘与高低极限。", "把数据录入脚本，自动计算 XYZ、欧氏误差与 P95。"],
    ["写误差分析脚本并出第一版图：空间散点 + 误差热力图。", "定位最大误差点，判断是标定、工装还是记录问题。"],
    ["复测异常点，比较不同温度/支架受力下的外参变化。", "整理表格并写外参验证报告：平均值、最大值、P95、结论。", "若平均误差 >3mm，制定重标定或修正安装方案。"],
    ["1h 复盘：确认外参“通过 / 需修正 / 重标定”的决策并记录。"]
  ],
  [
    ["定义数据协议：目录结构、文件命名、元数据字段、标注规范。", "列出采集矩阵：3 直径 × 3 高度 × 3 材质/颜色 × 3 姿态。"],
    ["搭采集台，准备直/横/斜姿态与遮挡物；固定相机参数。", "先试采 10 帧，检查点云质量、曝光与坐标系。"],
    ["采集第一批：视野中心、不同距离，约 60 帧。", "每帧记录采集条件与人工标注。"],
    ["采集第二批：视野边缘、轻度遮挡、多物体，约 60 帧。", "补采失败样本：反光、残缺、重叠。"],
    ["写数据质检脚本：空点云、字段缺失、时间戳异常、标注缺失。", "修正有问题的帧，更新数据字典。"],
    ["采集第三批 60–80 帧并完成人工标注，总量 ≥180。", "用 20 帧跑现有算法，记录基线成功率与失败类型。", "更新 README，确保别人能复现采集流程。"],
    ["1h 复盘：检查数据覆盖是否均衡，列出下周算法优先级。"]
  ],
  [
    ["把基线失败分成四类：分割、拟合、轴线消歧、坐标变换。", "统计每类占比，确定本周主攻顺序。"],
    ["加入欧式聚类与平面去除参数扫描，固定评价脚本。", "为参数配置加版本号，避免结果不可追溯。"],
    ["处理圆柱轴线消歧与顶/底面识别，输出置信度。", "对多物体场景加目标选取规则：尺寸、距离、聚焦区域。"],
    ["处理离群点、边缘残缺与部分遮挡；记录失败原因。", "对同一目标重复采集，测中心与轴向重复性。"],
    ["固化参数，补齐失败原因日志与调试点云导出。", "跑全量数据集，统计单圆柱/多物体/各姿态成功率。"],
    ["月 1 验收：单圆柱 50 次、多物体 50 次；记录成功率与重复性。", "对照门槛出月报：外参、数据集、检测、重复性。", "未达标则定 1 周补救计划，不带病进入月 2。"],
    ["1h 复盘：确认月 1 门是否通过；更新资源阅读进度。"]
  ],

  [
    ["确认抓手型号、开口、指厚、重量、通信/IO 方式，建参数表。", "核实工具重量与重心，更新机器人负载参数。"],
    ["实测法兰→TCP 变换，至少用 3 种姿态交叉验证。", "把 TCP 写入配置并打印验证。"],
    ["建立抓手碰撞包络（开/闭两态）与简化 URDF 模型。", "检查指尖、指根、线缆的易碰区域。"],
    ["写圆柱抓取候选生成器：顶部垂直、侧面水平、端面轴向。", "每个候选输出接触点、接近方向、夹持深度。"],
    ["做候选去重与初筛：可达性、开口、碰撞粗判。", "在 RViz 或可视化工具中显示候选。"],
    ["桌面实测开口、接触位置与夹持深度，记录 20 组。", "修正抓手几何模型与 TCP；复核碰撞包络。", "输出工具配置版本，锁定本周参数。"],
    ["1h 复盘：确认 TCP、负载、工具模型三项冻结。"]
  ],
  [
    ["定义评分维度：IK、关节余量、碰撞、接触长度、质心偏差、遮挡、撤离方向。", "先给权重和阈值，写明每个维度的失败原因。"],
    ["实现规则评分器，输出每候选的分项分数与总分。", "对典型圆柱跑 Top-3 候选。"],
    ["批量跑数据集候选，统计可行率、无解率与碰撞率。", "把失败按维度归类。"],
    ["做敏感性分析：位姿扰动 ±2mm/±5mm 下候选是否稳定。", "找出最敏感维度，调整权重或加保守阈值。"],
    ["固化评分参数；补 3 个典型样例的回归测试。", "可选：用 GPD 对同一帧做旁路比较，只记录不替换。"],
    ["离线复评 50 个场景，确定主抓取策略与兜底策略。", "出评分报告：策略成功率、平均分、失败原因。", "把策略写入配置，供状态机调用。"],
    ["1h 复盘：确认“顶抓优先还是侧抓优先”，记录理由。"]
  ],
  [
    ["准备 Ubuntu 22.04 + ROS 2 Humble 环境，固定版本与软件源。", "记录安装清单，保证可以重装。"],
    ["编译 Doosan 官方 ROS 2 包，启动虚拟 M1013，检查 joint states。", "确认命名空间、端口与 TF 前缀。"],
    ["整理 M1013 的 URDF/Xacro、SRDF 与关节限位。", "配置 arm1、gripper 两个规划组。"],
    ["配置 MoveIt 2 + RViz，用 MoveGroupInterface 规划到给定关节/位姿目标。", "记录规划时间与失败原因。"],
    ["加入桌面、相机支架、圆柱碰撞体；检查自碰撞矩阵。", "让仿真场景与真实工作区尺寸一致。"],
    ["打通“点云→目标位姿→预抓取规划”的离线链路。", "跑 20 个随机目标，修坐标系与碰撞问题。", "保存启动脚本与版本清单。"],
    ["1h 复盘：确认仿真链路可重复启动，记录遗留问题。"]
  ],
  [
    ["定义 14 状态、每态成功条件、超时、错误码、重试次数与安全退出。", "画状态转移图，标出所有异常边。"],
    ["实现 ACQUIRE→DETECT→VALIDATE→GENERATE_GRASPS。", "为每个状态写日志字段。"],
    ["实现 PLAN_PREGRASP→MOVE→APPROACH→CLOSE_GRIPPER→VERIFY。", "加入抓取后验证的替代方案：位置、电流或传感器。"],
    ["实现 RETREAT→PLACE→OPEN→RETURN_HOME。", "统一保存轨迹、位姿、配置与结果。"],
    ["仿真跑 20 次，修状态机边界与超时；补异常路径测试。", "检查失败后是否能回到安全态。"],
    ["仿真 100 次验收：成功率、碰撞、超时、重试。", "出月 2 报告与真机前检查表。", "确认视觉算法仍可独立运行。"],
    ["1h 复盘：逐项核对仿真门槛，决定是否上真机。"]
  ],

  [
    ["写分级执行清单：断连→连接→上伺服→低速→预抓取→空循环。", "为每级定义进入条件、退出条件与观察项。"],
    ["实现速度 5–10%、工作空间盒、单次目标跳变限制。", "加入机器人状态、控制权、报警检查；急停后禁自动恢复。"],
    ["第 1–3 级演练：离线打印、连接不上伺服、上伺服不发运动。", "核对权限门与错误码是否生效。"],
    ["第 4 级：低速移动到安全观察点，记录关节误差与振动。", "检查急停与保护停止行为。"],
    ["第 5–6 级：预抓取位姿、空抓取循环；验证抓手 IO 与日志。", "保存每次运动目标与执行结果。"],
    ["完整空载 30 次，测周期时间与异常率。", "修安全边界与日志缺口，做安全评审。", "安全评审通过前不加载真实目标。"],
    ["1h 复盘：确认安全评审结论，列出带目标测试的许可条件。"]
  ],
  [
    ["固定工况：单一哑光圆柱、固定区域、无遮挡、顶抓、固定放置点。", "准备 50 次实验记录表：视觉/规划/抓取/放置/周期。"],
    ["标定抓取高度、夹持深度与放置高度；验证 TCP 与工件尺寸。", "录一条标准流程视频作为基线。"],
    ["做 15 次抓取，逐次记录结果与失败原因。", "每次失败后只做必要修正，保持工况不变。"],
    ["分析失败：定位偏差、滑移、未夹稳、规划失败、视觉失败。", "对最高频失败做一次针对性实验。"],
    ["修正夹持深度、接近方向、速度；回归 5 次。", "把修正写入配置并记录版本。"],
    ["完成剩余 30 次实验；统计四阶段成功率与周期。", "保存视频、日志和失败样本。", "出单工况基线报告。"],
    ["1h 复盘：确定随机化顺序，先加哪个变量。"]
  ],
  [
    ["设计随机化矩阵：位置→旋转→尺寸→姿态→视野边缘→多物体→轻遮挡。", "规定每组样本量与成功判据。"],
    ["加入工作空间内随机位置采样，跑 20 次。", "对比固定位置的差异，记录失败模式。"],
    ["加入绕 Z 轴随机旋转，跑 20 次。", "检查抓取候选评分在旋转下的稳定性。"],
    ["更换直径/高度组合，跑 20 次；更新抓取参数策略。", "记录不同尺寸的夹持深度与成功率。"],
    ["加入横放/倾斜姿态，跑 20 次。", "分析轴线估计误差对抓取的影响。"],
    ["加入视野边缘、多物体、轻遮挡，每组 20 次。", "出失败帕累托图，确定月验收配比。", "保留一组完全未调参的“盲测”场景。"],
    ["1h 复盘：冻结月 3 验收的 100 次实验方案。"]
  ],
  [
    ["冻结代码、配置与数据集版本；写自动记录脚本。", "确认验收门槛与统计口径：成功率、P50/P95、失败分类。"],
    ["跑 40 次：固定与随机混合；检查数据完整性。", "当天完成数据备份，不把问题留到最后。"],
    ["跑 40 次；记录突发故障与人工干预。", "如果出现保护停止，暂停并做安全检查。"],
    ["跑剩余 20 次；补失败复现实验。", "整理失败样本，标注可修复/不可修复。"],
    ["统计成功率、周期、失败分布；对照门槛。", "写单臂验收报告初稿。"],
    ["复测未达标项；决定“通过 / 补 1 周 / 降级目标”。", "通过后冻结单臂版本，作为双臂阶段的基线。", "出最终单臂报告与双臂进入决策。"],
    ["1h 复盘：把单臂经验写成 1 页“踩坑清单”。"]
  ],

  [
    ["定义 world 坐标：原点、轴向、单位、命名规范。", "画两臂 + 相机的坐标树。"],
    ["标定 T_world_robot1_base，重复 5 次检查稳定性。", "记录标定方法与残差。"],
    ["标定 T_world_robot2_base，用同一标定物交叉验证。", "核对两臂 base 的相对关系。"],
    ["标定 T_world_camera；把同一目标分别转到两臂 base。", "比较两臂看到的同一目标位置。"],
    ["写一致性检查脚本：共享点位置误差、姿态角误差。", "定义 5mm 阈值与超限处理。"],
    ["在共享区测 15 个点，覆盖交接区边缘。", "误差 >5mm 时先修正，不进入交接。", "出 world 标定与一致性报告。"],
    ["1h 复盘：确认是否具备进入双臂任务的条件。"]
  ],
  [
    ["组合两台 M1013 的 Xacro，统一 TF 前缀、命名空间、端口。", "检查 frame 命名不与单臂冲突。"],
    ["配两套控制器与 joint states，验证单独运动。", "确认急停与状态读取互不干扰。"],
    ["建 arm1、arm2、both_arms、gripper1、gripper2 规划组。", "设置每个组的末端与 IK 参数。"],
    ["配置双臂碰撞矩阵；加载桌面、相机、交接区、障碍。", "检查自碰撞与交叉碰撞检测。"],
    ["测试同时规划与共享场景更新；观察互碰检测与死锁。", "记录规划时间与失败原因。"],
    ["构建完整双臂仿真场景，跑 20 组规划。", "修 TF/控制器/碰撞模型问题；固化启动脚本。", "出双臂模型版本清单。"],
    ["1h 复盘：确认双臂模型可供任务层调用。"]
  ],
  [
    ["设计共享区互斥锁、区域占用表与任务优先级。", "规定冲突时的等待/让行策略。"],
    ["实现任务队列与时间同步；两臂分别抓 A/B 物体。", "给每个任务加超时与取消。"],
    ["加入失败联动：一臂失败，另一臂进入安全态。", "验证共享区释放与死锁恢复。"],
    ["跑 20 组独立协同，测等待时间、冲突次数、周期。", "记录失败与人工干预。"],
    ["优化调度与安全距离；补异常日志。", "把互斥规则写入配置。"],
    ["30 组稳定性测试，检查两臂是否互碰或长时间等待。", "出协同报告与共享区布局建议。", "确定交接区与预接收位姿。"],
    ["1h 复盘：确认月 4 交接任务的边界与安全条件。"]
  ],
  [
    ["设计交接 7 步流程与双方到位条件，定义超时与取消。", "画出交接区尺寸、接近方向与撤离路径。"],
    ["实现 Arm1 抓取→移动到交接区；Arm2 到预接收位姿。", "验证两臂在交接区的距离与遮挡。"],
    ["实现 Arm2 闭合→验证抓稳→Arm1 松开撤离。", "为“未接稳”设计重试与放弃路径。"],
    ["跑 10 次交接，记录双方位置/电流/时序；有力传感器则记力。", "分析失败：高度、角度、时序、夹持。"],
    ["修正交接高度/角度/等待时间；加入回退。", "确认任意一步超时都能安全退出。"],
    ["30 次交接验收；统计成功率与失败类型。", "出月 4 报告；决定月 5 共同搬运的物体与边界。", "若 <85%，先修交接，不进入共同搬运。"],
    ["1h 复盘：更新双臂安全规则与共享区作业规范。"]
  ],

  [
    ["推导两 TCP 与物体之间的相对位姿约束，写成可计算形式。", "定义位置误差与姿态误差的度量。"],
    ["读双臂综述的建模/规划/控制/学习四层，做一张地图笔记。", "标出本计划采用的方法与暂不涉及的方法。"],
    ["实现相对位姿误差计算：位置 + 旋转矩阵/四元数。", "用合成数据验证误差计算的符号与方向。"],
    ["学雅可比、零空间、主从控制与内力的基本概念。", "把概念映射到 M1013 的关节/末端量。"],
    ["写最小闭链仿真：两臂夹持刚性杆，验证约束闭合。", "记录数值误差与迭代收敛情况。"],
    ["用 Python/MATLAB 做数值实验：扰动一臂，观察另一臂与物体误差。", "比较主从与相对位姿约束两种方案。", "确定共同搬运控制方案与阈值。"],
    ["1h 复盘：把闭链方案写成 1 页设计说明。"]
  ],
  [
    ["建长条刚体与两侧抓取点，设置附着关系与质量属性。", "确定 leader/follower 角色与交换条件。"],
    ["实现 leader 轨迹 + follower 保持相对位姿。", "先不加障碍，只做直线平移。"],
    ["仿真直线平移 100mm，记录两 TCP 相对误差。", "检查关节速度与加速度连续性。"],
    ["加入 ±10° 小角度旋转，观察约束漂移。", "调整 follower 的更新频率与增益。"],
    ["加入绕障规划，检查碰撞与轨迹可行性。", "记录最小避碰距离与规划时间。"],
    ["跑 30 组仿真：直线、旋转、绕障。", "统计相对位置/姿态误差、同步误差、最小距离。", "冻结仿真参数与验收阈值。"],
    ["1h 复盘：确认仿真结果是否足以进入轨迹同步。"]
  ],
  [
    ["统一两臂采样周期与时间基准，设计启动屏障。", "定义同步开始与结束条件。"],
    ["实现心跳、超时、双停与执行进度监测。", "处理一臂滞后、丢包、控制器重启。"],
    ["加入轨迹时间参数化，消除速度/加速度跳变。", "检查两臂轨迹的时间对齐。"],
    ["注入延迟与丢包，测同步误差与安全停行为。", "记录最坏情况下的偏差。"],
    ["优化同步模块；补错误码与日志。", "确认一臂异常时另一臂不会继续走完轨迹。"],
    ["30 组同步测试；统计最大偏差、超时次数、恢复行为。", "出同步模块测试记录。", "准备真机分级测试清单。"],
    ["1h 复盘：确认同步模块可上真机，列出降速与限位。"]
  ],
  [
    ["复核负载、夹持力、重心与速度限制；划定共享工作区。", "确认无力传感器时的保守策略。"],
    ["第 1–2 级：空载同步；两臂各持不同物体同步移动。", "记录轨迹跟随误差。"],
    ["第 3–4 级：同物接触不抬；轻抬离桌面 5–10mm。", "监测滑移、电流与姿态变化。"],
    ["第 5 级：水平移动 50mm，记录相对误差。", "出现滑移或报警立即停止并分析。"],
    ["第 6 级：移动 200mm；检查长时间同步稳定性。", "记录关节温度/电流与最小距离。"],
    ["第 7 级：小角度旋转并放回，20 次。", "出月 5 真机报告与风险结论。", "无力传感器则明确不扩大物体重量/距离。"],
    ["1h 复盘：确认是否进入力控与最终实验阶段。"]
  ],

  [
    ["盘点力控条件：六维力、关节电流、浮动机构、柔性指尖。", "选定方案并写明适用边界。"],
    ["有传感器：搭最小阻抗/导纳回路；无传感器：设计柔性指尖与位置容差。", "确认斗山内置力控接口的坐标系与停止行为。"],
    ["标定力零点与工具坐标系；设力/力矩限幅。", "测试超限停止与恢复流程。"],
    ["单臂接触实验：恒力压桌面/圆柱，测稳态误差。", "记录接触事件与抖动。"],
    ["双臂共同持物，监测内力与物体合力；无力传感器则看电流差。", "调整顺应参数，避免过约束。"],
    ["低速搬运 + 顺应性实验 20 次，记录最大力/滑移。", "更新安全限值与停止策略。", "出顺应性实验记录。"],
    ["1h 复盘：确认力控是否足够支撑最终实验。"]
  ],
  [
    ["列 10 类故障与预期行为、错误码、恢复方式。", "确定每类故障的注入方法。"],
    ["注入感知故障：相机断开、空点云、错误物体。", "验证视觉层失败是否能阻断运动。"],
    ["注入规划故障：IK 失败、规划超时、目标跳变。", "验证重试上限与安全退出。"],
    ["注入执行故障：抓手未闭合、机器人掉线、保护停止。", "检查另一臂是否同步进入安全态。"],
    ["注入同步故障：时间不同步、一臂滞后、控制器重启。", "记录系统恢复时间。"],
    ["全量故障演练；检查安全停、日志、复盘信息。", "出故障矩阵与高危项修复清单。", "修复后抽查 3 类故障。"],
    ["1h 复盘：确认无高危未关闭项，准备最终实验。"]
  ],
  [
    ["冻结版本、配置与实验脚本；校准相机、TCP、力零点。", "准备四组实验的记录表与统计脚本。"],
    ["单臂固定圆柱抓放 50 次。", "中途不改参数，异常只记录。"],
    ["单臂随机圆柱抓放 50 次。", "保持随机种子与样本清单可追溯。"],
    ["双臂交接 50 次。", "记录失败类型与安全退出情况。"],
    ["双臂共同搬运 50 次。", "记录力/电流、最小距离、同步误差。"],
    ["补测失败项；统计成功率、P50/P95、失败分布。", "核对四组门槛，标出未达标项。", "导出最终数据与图表。"],
    ["1h 复盘：确认最终实验结论与局限。"]
  ],
  [
    ["整理架构、坐标、标定、接口文档目录与版本。", "核对文档中的参数与代码一致。"],
    ["整理代码仓库：README、启动脚本、配置样例、依赖。", "从干净环境按 README 启动一次。"],
    ["整理数据集与实验原始记录，写数据字典。", "归档失败样本与视频。"],
    ["写操作手册与安全检查表；写演示视频脚本。", "列出 3 个最关键的安全注意事项。"],
    ["录制并剪辑演示视频：单臂抓取、交接、共同搬运。", "补关键指标图与失败案例。"],
    ["写半年报告/论文初稿：方法、实验、结果、局限。", "做 1 页答辩式总结。", "定下一个半年目标与资源需求。"],
    ["1h 复盘：完成项目回顾，归档全部交付物。"]
  ]
];

const RESOURCES = [
  { type: "书籍", priority: "主线", title: "Modern Robotics: Mechanics, Planning, and Control", when: "月 1–6 · 贯穿", note: "第 3–6 章配合标定与抓取；第 7 章读闭链；第 9–11 章配合轨迹与力控。官网有免费预印本与视频。", link: "https://hades.mech.northwestern.edu/index.php/Modern_Robotics", label: "西北大学课程主页" },
  { type: "书籍", priority: "查阅", title: "Robotics: Modelling, Planning and Control", when: "月 4–6 · 按需", note: "Siciliano 等著。力控、视觉伺服、冗余与协作机械臂章节，作为推导补充。", link: "https://link.springer.com/book/10.1007/978-1-84628-642-1", label: "Springer" },
  { type: "书籍", priority: "查阅", title: "Springer Handbook of Robotics", when: "全程 · 词条", note: "只查 Grasping、Force Control、Motion Planning、Cooperative Manipulators，不需要通读。", link: "https://link.springer.com/book/10.1007/978-3-319-32552-1", label: "Springer" },
  { type: "书籍", priority: "选读", title: "Multiple View Geometry in Computer Vision", when: "月 1 · 参考", note: "相机模型与多视图几何参考。当前阶段坐标正确比公式完整更重要，不按顺序通读。", link: "https://www.robots.ox.ac.uk/~vgg/hzbook/", label: "官方书籍页" },

  { type: "论文", priority: "主线", title: "Dual Arm Manipulation — A Survey", when: "月 4–5", note: "建立双臂建模、规划与控制的整体地图。先读问题分类，不必啃完所有公式。", link: "https://doi.org/10.1016/j.robot.2012.07.005", label: "DOI" },
  { type: "论文", priority: "主线", title: "A Systematic Review on Cooperative Dual-Arm Manipulators", when: "月 4–5", note: "重点看建模、规划、控制与视觉四类方法的对比表，帮助选型。", link: "https://doi.org/10.1007/s41315-023-00292-0", label: "DOI" },
  { type: "论文", priority: "选读", title: "Grasp Pose Detection in Point Clouds", when: "月 2 · 旁路比较", note: "理解无 CAD 模型的 6D 抓取。只在解析基线稳定后做一组对比，不换主线。", link: "https://arxiv.org/abs/1706.09911", label: "arXiv" },
  { type: "论文", priority: "选读", title: "Dex-Net 2.0", when: "月 2 · 旁路比较", note: "看抓取质量与合成数据思路。训练与部署成本高，这半年不作为主线。", link: "https://berkeleyautomation.github.io/dex-net/", label: "项目页" },
  { type: "论文", priority: "选读", title: "Contact-GraspNet", when: "月 2 · 旁路比较", note: "杂乱场景下的学习式抓取。依赖较旧，需单独环境；没有 GPU 可只读方法。", link: "https://arxiv.org/abs/2103.14127", label: "arXiv" },
  { type: "论文", priority: "查阅", title: "A Unified Approach for Motion and Force Control (Khatib, 1987)", when: "月 5 · 力控", note: "操作空间与力控制的基础。配合闭链约束、内力与零空间一起读。", link: "https://doi.org/10.1109/JRA.1987.1087109", label: "DOI" },

  { type: "代码", priority: "主线", title: "Doosan Robotics ROS 2", when: "月 2 起", note: "M1013、虚拟模式、MoveIt 2 与多机器人。最先跑通的官方栈，注意命名空间与端口隔离。", link: "https://github.com/DoosanRobotics/doosan-robot2", label: "GitHub" },
  { type: "代码", priority: "主线", title: "MoveIt 2", when: "月 2 起", note: "规划、碰撞、Planning Scene。重点掌握 MoveGroupInterface 与场景对象增删。", link: "https://github.com/moveit/moveit2", label: "GitHub" },
  { type: "代码", priority: "主线", title: "MoveIt Task Constructor", when: "月 2", note: "把接近、抓取、附着、搬运、放置组织成可调试的多阶段任务，可对照自研状态机。", link: "https://github.com/moveit/moveit_task_constructor", label: "GitHub" },
  { type: "代码", priority: "主线", title: "Mech-Mind Robotics", when: "月 1", note: "Mech-Eye 的 ROS/ROS 2 接口与示例。先对齐相机坐标系与标定参数格式。", link: "https://github.com/MechMindRobotics", label: "GitHub" },
  { type: "代码", priority: "选读", title: "GPD — Grasp Pose Detection", when: "月 2 · 旁路比较", note: "依赖相对较旧，单独容器或 Conda 环境；不要污染现有 Mech-Eye/PCL 环境。", link: "https://github.com/atenpas/gpd", label: "GitHub" },
  { type: "代码", priority: "选读", title: "Contact-GraspNet", when: "月 2 · 旁路比较", note: "学习式抓取基线。先确认 GPU 与依赖，再决定是否投入时间。", link: "https://github.com/NVlabs/contact_graspnet", label: "GitHub" },
  { type: "代码", priority: "选读", title: "Robotics Toolbox for Python", when: "月 5 · 数值实验", note: "做闭链、雅可比与轨迹数值实验，比手搓矩阵更省时间。", link: "https://github.com/petercorke/robotics-toolbox-python", label: "GitHub" },

  { type: "课程", priority: "主线", title: "Modern Robotics 配套视频与习题", when: "月 1–6 · 每周一", note: "配合教材使用。重点看刚体运动、正逆运动学、轨迹生成、运动规划与控制。", link: "https://hades.mech.northwestern.edu/index.php/Modern_Robotics_Videos", label: "官方视频页" },
  { type: "课程", priority: "主线", title: "MoveIt 2 Tutorials", when: "月 2", note: "RViz、Planning Scene、MoveGroupInterface 三节必须亲手跑通。", link: "https://moveit.picknik.ai/main/doc/tutorials/tutorials.html", label: "官方教程" },
  { type: "课程", priority: "选看", title: "ROS 2 MoveIt 2 一小时入门", when: "月 2 · 建立整体认识", note: "原计划中的视频，版本较旧但整体流程可参考。不要照搬版本号。", link: "https://www.youtube.com/watch?v=-xDyxxRiW7M", label: "YouTube" },
  { type: "课程", priority: "选看", title: "双机械臂 MoveIt 示例", when: "月 4", note: "看双臂 URDF、规划组与控制器的组织方式，不必照搬旧版本。", link: "https://www.youtube.com/watch?v=IC33SOa3qQE", label: "YouTube" },
  { type: "课程", priority: "主线", title: "Mech-Mind 3D Robot Guidance 学习路径", when: "月 1", note: "重点手眼标定、抓取位姿与通信接口。和你的 Mech-Eye Pro S 对照使用。", link: "https://docs.mech-mind.net/en/home/latest/index.html", label: "官方文档" }
];

/* ---------- constants & helpers ---------- */

const DOW = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const DOW_SHORT = ["一", "二", "三", "四", "五", "六", "日"];
const DAY_HOURS = [2, 2, 2, 2, 2, 5, 1];
const DAY_TYPES = [
  { label: "理论", kind: "theory" },
  { label: "开发", kind: "build" },
  { label: "开发", kind: "build" },
  { label: "实验", kind: "experiment" },
  { label: "集成", kind: "integration" },
  { label: "深度工作", kind: "deep" },
  { label: "复盘", kind: "review" }
];

const STORE_KEY = "grasp24.progress.v1";
const START_KEY = "grasp24.start.v1";
const TOTAL_DAYS = 168;
const RESOURCE_TYPES = ["全部", "书籍", "论文", "代码", "课程"];

const pad2 = (n) => String(n).padStart(2, "0");
const dayNumber = (date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
const mondayOf = (date) => addDays(date, -((date.getDay() + 6) % 7));
const isoOf = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const parseISO = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const fmtShort = (date) => `${date.getMonth() + 1}.${pad2(date.getDate())}`;
const fmtFull = (date) => `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
const fmtCN = (date) => `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
const weekdayCN = (date) => ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];

function defaultStart() {
  const today = new Date();
  const monday = mondayOf(today);
  return (today.getDay() === 0 || today.getDay() === 6) ? addDays(monday, 7) : monday;
}

function loadStart() {
  try {
    const saved = localStorage.getItem(START_KEY);
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) return mondayOf(parseISO(saved));
  } catch (error) { /* localStorage can be unavailable */ }
  return defaultStart();
}

function loadDone() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : []);
  } catch (error) {
    return new Set();
  }
}

function saveDone() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...done]));
  } catch (error) { /* ignore quota errors */ }
}

function saveStart() {
  try {
    localStorage.setItem(START_KEY, isoOf(startMonday));
  } catch (error) { /* ignore quota errors */ }
}

let done = loadDone();
let startMonday = loadStart();
let activePhase = "all";
let activeResourceType = "全部";
let hideDone = false;
const expanded = new Set();

const WEEKS = WEEK_META.map((meta, index) => {
  const no = index + 1;
  const phase = PHASES.find((p) => no >= p.startWeek && no <= p.endWeek);
  const plan = DAY_PLAN[index];
  return {
    ...meta,
    no,
    phase,
    days: DOW.map((dow, dayIndex) => ({
      id: `w${no}d${dayIndex + 1}`,
      dow,
      dayIndex,
      date: addDays(startMonday, index * 7 + dayIndex),
      hours: DAY_HOURS[dayIndex],
      type: DAY_TYPES[dayIndex],
      tasks: plan[dayIndex]
    }))
  };
});

function rebuildDates() {
  WEEKS.forEach((week, index) => {
    week.days.forEach((day, dayIndex) => {
      day.date = addDays(startMonday, index * 7 + dayIndex);
    });
  });
}

function getNow() {
  const today = new Date();
  const idx = dayNumber(today) - dayNumber(startMonday);
  if (idx < 0 || idx >= TOTAL_DAYS) return { status: idx < 0 ? "before" : "after", today, idx };
  const weekIdx = Math.floor(idx / 7);
  const dayIdx = idx % 7;
  const week = WEEKS[weekIdx];
  return { status: "active", today, idx, weekIdx, dayIdx, week, day: week.days[dayIdx] };
}

function gateDate(phase) {
  return addDays(startMonday, phase.endWeek * 7 - 1);
}

function nextGateInfo(today) {
  const upcoming = PHASES.map((phase) => ({ phase, date: gateDate(phase) }))
    .find((item) => dayNumber(item.date) >= dayNumber(today));
  if (!upcoming) return { text: "六道验收门已到期，重点转入复盘与补测", className: "" };
  const diff = dayNumber(upcoming.date) - dayNumber(today);
  const when = diff === 0 ? "就在今天" : `还有 ${diff} 天`;
  return {
    text: `G${upcoming.phase.id} · ${fmtShort(upcoming.date)} · ${when}`,
    className: diff <= 7 ? "gate-hint" : ""
  };
}

function phaseDoneCount(phase) {
  let count = 0;
  for (let w = phase.startWeek; w <= phase.endWeek; w += 1) {
    for (const day of WEEKS[w - 1].days) if (done.has(day.id)) count += 1;
  }
  return count;
}

function weekDoneCount(week) {
  return week.days.filter((day) => done.has(day.id)).length;
}

function escapeAttr(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------- render: today ---------- */

function renderToday() {
  const panel = document.getElementById("todayPanel");
  if (!panel) return;
  const now = getNow();
  const startControl = `
    <div class="start-row">
      <label for="startDate">起始周</label>
      <input type="date" id="startDate" value="${isoOf(startMonday)}" aria-label="计划起始周的日期，自动对齐到周一">
      <span class="start-hint">自动对齐周一</span>
    </div>`;

  if (now.status === "before") {
    const days = dayNumber(startMonday) - dayNumber(now.today);
    const firstWeek = WEEKS[0];
    panel.innerHTML = `
      <div class="today-top">
        <span class="today-label">PREP / 准备周</span>
        <span class="today-date"><strong>${fmtFull(now.today)}</strong><span>${weekdayCN(now.today)}</span></span>
      </div>
      <div class="countdown"><strong>${days}</strong><span>天后开始第 1 周</span></div>
      <p class="today-focus">先从第 1 周的准备任务开始：检查旧程序、补齐硬件信息、写下安全红线。</p>
      <ul class="preview-tasks">${firstWeek.days[0].tasks.map((task) => `<li>${task}</li>`).join("")}</ul>
      <a class="today-link" href="#weeks">预览第 1 周安排 →</a>
      ${startControl}
    `;
    return;
  }

  if (now.status === "after") {
    const pct = Math.round((done.size / TOTAL_DAYS) * 100);
    panel.innerHTML = `
      <div class="today-top">
        <span class="today-label">REVIEW / 计划结束</span>
        <span class="today-date"><strong>${fmtFull(now.today)}</strong><span>${weekdayCN(now.today)}</span></span>
      </div>
      <div class="countdown"><strong>${pct}%</strong><span>总体完成度</span></div>
      <p class="today-focus">24 周计划周期已经结束。建议回看最终实验数据，补齐报告与演示视频，并确定下一个半年方向。</p>
      <p class="today-min"><b>下一步</b>力控、学习式抓取，还是把现有系统产品化？</p>
      <a class="today-link" href="#w24">回看第 24 周 →</a>
      ${startControl}
    `;
    return;
  }

  const { week, day, weekIdx, dayIdx } = now;
  const phase = week.phase;
  const weekday = day.dow;
  const dayDone = done.has(day.id);
  const gate = nextGateInfo(now.today);
  const weekCount = weekDoneCount(week);
  const dots = week.days.map((item, index) => {
    const isDone = done.has(item.id);
    const isCurrent = index === dayIdx;
    return `<span class="dot${isDone ? " is-done" : ""}${isCurrent ? " is-current" : ""}"><i></i><span>${DOW_SHORT[index]}</span></span>`;
  }).join("");

  panel.innerHTML = `
    <div class="today-top">
      <span class="today-label">TODAY / 今日任务</span>
      <span class="today-date"><strong>${fmtFull(now.today)}</strong><span>${weekdayCN(now.today)}</span></span>
    </div>
    <div class="today-phase">
      <span class="phase-pill" style="--ph:${phase.color}">月 ${phase.id} · ${phase.cn}</span>
      <span class="today-week">第 ${week.no} 周 · ${weekday}</span>
    </div>
    <h2 class="today-title">${week.title}</h2>
    <p class="today-focus">${week.focus}</p>
    <ul class="today-tasks">
      ${day.tasks.map((task) => `<li class="${dayDone ? "is-done" : ""}">${task}</li>`).join("")}
    </ul>
    <div class="today-week-block">
      <div class="today-week-head">
        <span>WEEK ${pad2(week.no)} · 本周节奏</span>
        <span>${weekCount}/7 天</span>
      </div>
      <div class="week-dots" role="img" aria-label="本周已完成 ${weekCount} 天，共 7 天">${dots}</div>
    </div>
    <div class="today-info">
      <span><b>${day.hours}h</b> · ${day.type.label}</span>
      <span class="${gate.className}"><b>下一道门</b> ${gate.text}</span>
    </div>
    <button class="check-btn${dayDone ? " is-done" : ""}" type="button" data-today-check aria-pressed="${dayDone}">
      ${dayDone ? "已完成 · 点击撤销打卡" : "标记今日完成"}
    </button>
    <div class="today-min"><b>本周最小完成线</b>${week.min}</div>
    ${startControl}
  `;
}

/* ---------- render: filters ---------- */

function renderFilters() {
  const filter = document.getElementById("phaseFilter");
  if (!filter) return;
  const options = [{ id: "all", label: `全部 · 24 周` }, ...PHASES.map((p) => ({ id: String(p.id), label: `${p.code} ${p.cn}` }))];
  filter.innerHTML = options.map((option) => `
    <button class="chip${activePhase === option.id ? " is-active" : ""}" type="button" data-phase-filter="${option.id}" aria-pressed="${activePhase === option.id}">
      ${option.label}
    </button>`).join("");

  const resourceFilter = document.getElementById("resourceFilter");
  if (resourceFilter) {
    resourceFilter.innerHTML = RESOURCE_TYPES.map((type) => `
      <button class="chip${activeResourceType === type ? " is-active" : ""}" type="button" data-resource-filter="${type}" aria-pressed="${activeResourceType === type}">
        ${type}${type === "全部" ? "" : ` · ${RESOURCES.filter((r) => r.type === type).length}`}
      </button>`).join("");
  }
}

/* ---------- render: week list ---------- */

function renderWeekList() {
  const list = document.getElementById("weekList");
  if (!list) return;
  const empty = document.getElementById("emptyNote");
  const now = getNow();
  const currentWeekNo = now.status === "active" ? now.week.no : null;
  const filtered = WEEKS.filter((week) => {
    if (activePhase !== "all" && String(week.phase.id) !== activePhase) return false;
    if (hideDone && weekDoneCount(week) === 7) return false;
    return true;
  });

  if (!filtered.length) {
    list.innerHTML = "";
    if (empty) empty.hidden = false;
    updateToggleAllLabel();
    return;
  }
  if (empty) empty.hidden = true;

  // If a phase filter leaves nothing open, open the first matching week.
  if (activePhase !== "all" && !filtered.some((week) => expanded.has(week.no))) {
    expanded.add(filtered[0].no);
  }

  list.innerHTML = filtered.map((week) => {
    const phase = week.phase;
    const isOpen = expanded.has(week.no);
    const isCurrent = currentWeekNo === week.no;
    const rangeStart = week.days[0].date;
    const rangeEnd = week.days[6].date;
    const doneCount = weekDoneCount(week);
    const gateHtml = week.no === phase.endWeek ? `
      <div class="gate-box">
        <div class="gate-head">
          <span class="gate-badge">G${phase.id} · 月 ${phase.id} 验收门</span>
          <span class="gate-week">${fmtShort(gateDate(phase))} 截止</span>
        </div>
        <ul>${phase.gates.map((item) => `<li>${item}</li>`).join("")}</ul>
        <p class="gate-fallback"><b>未过怎么办：</b>${phase.fallback}</p>
      </div>` : "";

    const daysHtml = week.days.map((day) => {
      const isToday = isCurrent && now.day.id === day.id;
      const isDone = done.has(day.id);
      return `
        <li class="day-row${isToday ? " is-current" : ""}${isDone ? " is-done" : ""}${day.dayIndex === 6 ? " kind-review" : ""}" data-day-row="${day.id}">
          <div class="day-date">
            <span class="dow">${day.dow}</span>
            <span class="date">${fmtShort(day.date)}</span>
            ${isToday ? '<span class="today-flag">今天</span>' : ""}
          </div>
          <div class="day-hours">
            <span class="tag tag-${day.type.kind}">${day.type.label}</span>
            <span class="hours">${day.hours}h</span>
          </div>
          <div class="day-tasks">${day.tasks.map((task) => `<p>${task}</p>`).join("")}</div>
          <label class="day-check">
            <input type="checkbox" data-day-id="${day.id}" ${isDone ? "checked" : ""} aria-label="标记 ${fmtCN(day.date)}（${day.dow}）完成">
            <span class="box" aria-hidden="true"></span>
          </label>
        </li>`;
    }).join("");

    return `
      <article class="week-card${isCurrent ? " is-current" : ""}" id="w${week.no}" data-week="${week.no}" style="--ph:${phase.color}">
        <button class="week-toggle" type="button" aria-expanded="${isOpen}" aria-controls="week-body-${week.no}">
          <span class="week-no">W${pad2(week.no)}</span>
          <span class="week-title-wrap">
            <span class="week-eyebrow">
              <span class="week-phase">月 ${phase.id} · ${phase.cn}</span>
              <span class="week-range">${fmtShort(rangeStart)} — ${fmtShort(rangeEnd)}</span>
              ${isCurrent ? '<span class="week-current-flag">本周</span>' : ""}
            </span>
            <span class="week-title">${week.title}</span>
          </span>
          <span class="week-progress">
            <span class="week-count">${doneCount}/7 天</span>
            <span class="week-bar"><i style="width:${(doneCount / 7) * 100}%"></i></span>
          </span>
          <span class="chev" aria-hidden="true"></span>
        </button>
        <div class="week-body" id="week-body-${week.no}"${isOpen ? "" : " hidden"}>
          <div class="week-brief">
            <div><span class="micro-label">本周目标</span><p>${week.focus}</p></div>
            <div><span class="micro-label">最小完成线</span><p>${week.min}</p></div>
            <div><span class="micro-label">本周产出</span><p>${week.output}</p></div>
          </div>
          <ol class="day-list">${daysHtml}</ol>
          ${gateHtml}
        </div>
      </article>`;
  }).join("");

  updateToggleAllLabel();
}

function updateToggleAllLabel() {
  const button = document.getElementById("toggleAll");
  if (!button) return;
  const bodies = [...document.querySelectorAll("#weekList .week-body")];
  const anyHidden = bodies.length === 0 || bodies.some((body) => body.hidden);
  button.textContent = anyHidden ? "展开全部" : "收起全部";
}

/* ---------- render: phases ---------- */

function renderPhases() {
  const grid = document.getElementById("phaseGrid");
  if (!grid) return;
  grid.innerHTML = PHASES.map((phase) => {
    const count = phaseDoneCount(phase);
    return `
      <article class="phase-card" style="--ph:${phase.color}">
        <div class="phase-top">
          <span class="phase-code">${phase.code} / G${phase.id}</span>
          <span class="phase-weeks">${phase.weeks}</span>
        </div>
        <span class="phase-name">${phase.name}</span>
        <h3>${phase.title}</h3>
        <p class="phase-goal">${phase.goal}</p>
        <div class="phase-progress">
          <span class="bar"><i style="width:${(count / 28) * 100}%"></i></span>
          <span class="num">完成 ${count} / 28 天</span>
        </div>
        <ul class="gate-list">${phase.gates.map((gate) => `<li>${gate}</li>`).join("")}</ul>
        <p class="phase-fallback"><b>未过怎么办：</b>${phase.fallback}</p>
        <button class="phase-jump text-btn" type="button" data-jump-phase="${phase.id}">查看这 4 周 →</button>
      </article>`;
  }).join("");
}

/* ---------- render: resources ---------- */

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  const count = document.getElementById("resourceCount");
  if (!grid) return;
  const filtered = RESOURCES.filter((resource) => activeResourceType === "全部" || resource.type === activeResourceType);
  grid.innerHTML = filtered.map((resource) => `
    <article class="resource-card">
      <div class="resource-top">
        <span class="resource-type">${resource.type}</span>
        <span class="resource-priority${resource.priority === "主线" ? " is-main" : ""}">${resource.priority}</span>
      </div>
      <h4>${resource.title}</h4>
      <p class="resource-when">${resource.when}</p>
      <p class="resource-note">${resource.note}</p>
      <a class="resource-link" href="${resource.link}" target="_blank" rel="nopener noreferrer">
        <span>${resource.label}</span><span class="arrow" aria-hidden="true">↗</span>
      </a>
    </article>`).join("");
  if (count) count.textContent = `${filtered.length} 项 · 共 ${RESOURCES.length} 项`;
}

/* ---------- progress ---------- */

function updateProgress() {
  const percent = Math.round((done.size / TOTAL_DAYS) * 100);
  const headerProgress = document.getElementById("headerProgress");
  const headerBar = document.getElementById("headerBar");
  if (headerProgress) headerProgress.textContent = `${percent}%`;
  if (headerBar) {
    headerBar.setAttribute("aria-valuenow", String(percent));
    const fill = headerBar.querySelector("span");
    if (fill) fill.style.width = `${percent}%`;
  }

  document.querySelectorAll(".week-card").forEach((card) => {
    const week = WEEKS[Number(card.dataset.week) - 1];
    if (!week) return;
    const count = weekDoneCount(week);
    const countEl = card.querySelector(".week-count");
    const barEl = card.querySelector(".week-bar i");
    if (countEl) countEl.textContent = `${count}/7 天`;
    if (barEl) barEl.style.width = `${(count / 7) * 100}%`;
  });

  document.querySelectorAll(".phase-card").forEach((card, index) => {
    const phase = PHASES[index];
    const count = phaseDoneCount(phase);
    const bar = card.querySelector(".phase-progress .bar i");
    const num = card.querySelector(".phase-progress .num");
    if (bar) bar.style.width = `${(count / 28) * 100}%`;
    if (num) num.textContent = `完成 ${count} / 28 天`;
  });
}

function syncDayDom(dayId, isDone) {
  document.querySelectorAll(`input[data-day-id="${dayId}"]`).forEach((input) => { input.checked = isDone; });
  document.querySelectorAll(`[data-day-row="${dayId}"]`).forEach((row) => { row.classList.toggle("is-done", isDone); });
}

function toggleDay(dayId, force) {
  const next = typeof force === "boolean" ? force : !done.has(dayId);
  if (next) done.add(dayId); else done.delete(dayId);
  saveDone();
  syncDayDom(dayId, next);
  updateProgress();
  renderToday();
}

/* ---------- events ---------- */

function bindEvents() {
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".week-toggle");
    if (toggle) {
      const card = toggle.closest(".week-card");
      const weekNo = Number(card.dataset.week);
      const body = document.getElementById(`week-body-${weekNo}`);
      if (!body) return;
      const willOpen = body.hidden;
      body.hidden = !willOpen;
      toggle.setAttribute("aria-expanded", String(willOpen));
      if (willOpen) expanded.add(weekNo); else expanded.delete(weekNo);
      updateToggleAllLabel();
      return;
    }

    const phaseButton = event.target.closest("[data-phase-filter]");
    if (phaseButton) {
      activePhase = phaseButton.dataset.phaseFilter;
      renderFilters();
      renderWeekList();
      return;
    }

    const jumpButton = event.target.closest("[data-jump-phase]");
    if (jumpButton) {
      activePhase = jumpButton.dataset.jumpPhase;
      renderFilters();
      renderWeekList();
      document.getElementById("weeks").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const resourceButton = event.target.closest("[data-resource-filter]");
    if (resourceButton) {
      activeResourceType = resourceButton.dataset.resourceFilter;
      renderFilters();
      renderResources();
      return;
    }

    const todayButton = event.target.closest("[data-today-check]");
    if (todayButton) {
      const now = getNow();
      if (now.status === "active") toggleDay(now.day.id);
      return;
    }

    const weekAnchor = event.target.closest('a[href^="#w"]');
    if (weekAnchor) {
      const weekNo = Number(weekAnchor.getAttribute("href").slice(2));
      const card = document.getElementById(`w${weekNo}`);
      const body = document.getElementById(`week-body-${weekNo}`);
      const button = card ? card.querySelector(".week-toggle") : null;
      if (body && body.hidden) {
        body.hidden = false;
        if (button) button.setAttribute("aria-expanded", "true");
        expanded.add(weekNo);
        updateToggleAllLabel();
      }
    }
  });

  document.addEventListener("change", (event) => {
    const dayInput = event.target.closest("input[data-day-id]");
    if (dayInput) {
      const dayId = dayInput.dataset.dayId;
      if (dayInput.checked) done.add(dayId); else done.delete(dayId);
      saveDone();
      syncDayDom(dayId, dayInput.checked);
      updateProgress();
      renderToday();
      return;
    }

    if (event.target.id === "startDate") {
      const value = event.target.value;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
      startMonday = mondayOf(parseISO(value));
      saveStart();
      rebuildDates();
      const now = getNow();
      const filtered = WEEKS.filter((week) => activePhase === "all" || String(week.phase.id) === activePhase);
      if (now.status === "active" && filtered.some((week) => week.no === now.week.no)) expanded.add(now.week.no);
      renderWeekList();
      renderToday();
      updateProgress();
      return;
    }

    if (event.target.id === "hideDone") {
      hideDone = event.target.checked;
      renderWeekList();
    }
  });

  const toggleAll = document.getElementById("toggleAll");
  if (toggleAll) {
    toggleAll.addEventListener("click", () => {
      const cards = [...document.querySelectorAll("#weekList .week-card")];
      if (!cards.length) return;
      const bodies = cards.map((card) => card.querySelector(".week-body")).filter(Boolean);
      const willOpen = bodies.some((body) => body.hidden);
      cards.forEach((card) => {
        const body = card.querySelector(".week-body");
        const button = card.querySelector(".week-toggle");
        if (!body || !button) return;
        body.hidden = !willOpen;
        button.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) expanded.add(Number(card.dataset.week)); else expanded.delete(Number(card.dataset.week));
      });
      updateToggleAllLabel();
    });
  }

  const reset = document.getElementById("resetProgress");
  if (reset) {
    reset.addEventListener("click", () => {
      if (!done.size) return;
      const confirmed = window.confirm("将清除当前浏览器里的全部打卡记录，确定吗？");
      if (!confirmed) return;
      done = new Set();
      saveDone();
      document.querySelectorAll("input[data-day-id]").forEach((input) => { input.checked = false; });
      document.querySelectorAll("[data-day-row]").forEach((row) => row.classList.remove("is-done"));
      updateProgress();
      renderToday();
    });
  }

  // Active navigation.
  const sections = ["today", "weeks", "route", "resources"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const links = new Map([...document.querySelectorAll(".nav-link")].map((link) => [link.getAttribute("href").slice(1), link]));
  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        });
        const link = links.get(entry.target.id);
        if (link) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-25% 0px -62% 0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
  }
}

/* ---------- init ---------- */

function init() {
  const now = getNow();
  if (now.status === "active") expanded.add(now.week.no);
  else expanded.add(now.status === "after" ? 24 : 1);
  renderToday();
  renderFilters();
  renderWeekList();
  renderPhases();
  renderResources();
  updateProgress();
  bindEvents();

  if (WEEKS.length !== 24 || WEEKS.some((week) => week.days.length !== 7)) {
    console.warn("Plan data incomplete: expected 24 weeks × 7 days.");
  }
}

init();
