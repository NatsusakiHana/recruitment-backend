const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

// 数据库名称
const DB_NAME = process.env.MYSQL_DATABASE || "recruitment_system";

const sequelize = new Sequelize(DB_NAME, MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql",
  timezone: '+08:00',
  logging: console.log,
});



// 文件表 - 存储所有上传的文件信息
const File = sequelize.define("File", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fileId: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '微信云存储文件ID',
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '文件名',
  },
  fileType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '文件类型：photo/id_card_front/id_card_back/other',
  },
  fileSize: {
    type: DataTypes.INTEGER,
    comment: '文件大小（字节）',
  },
  uploadBy: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '上传者openid',
  },
  uploadAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '上传时间',
  },
}, {
  tableName: 'files',
  timestamps: false,
});

// 报名信息表
const Submission = sequelize.define("Submission", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '报名者openid',
    index: true,
  },
  // 基本信息
  position: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '应聘岗位',
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '姓名',
  },
  formerName: {
    type: DataTypes.STRING(50),
    comment: '曾用名',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '手机号',
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱',
  },
  gender: {
    type: DataTypes.STRING(10),
    comment: '性别',
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    comment: '出生日期',
  },
  nation: {
    type: DataTypes.STRING(20),
    comment: '民族',
  },
  nativePlace: {
    type: DataTypes.STRING(100),
    comment: '籍贯',
  },
  familyOrigin: {
    type: DataTypes.STRING(50),
    comment: '家庭出身',
  },
  religion: {
    type: DataTypes.STRING(50),
    comment: '宗教信仰',
  },
  politicalStatus: {
    type: DataTypes.STRING(50),
    comment: '政治面貌',
  },
  partyTime: {
    type: DataTypes.DATEONLY,
    comment: '入党团时间',
  },
  idCard: {
    type: DataTypes.STRING(18),
    allowNull: false,
    comment: '身份证号',
  },
  registeredAddress: {
    type: DataTypes.STRING(255),
    comment: '户籍地址',
  },
  currentAddress: {
    type: DataTypes.STRING(255),
    comment: '常住地址',
  },
  mailAddress: {
    type: DataTypes.STRING(255),
    comment: '通讯地址',
  },
  zipCode: {
    type: DataTypes.STRING(10),
    comment: '邮政编码',
  },
  domicile: {
    type: DataTypes.STRING(50),
    comment: '户籍性质',
  },
  maritalStatus: {
    type: DataTypes.STRING(20),
    comment: '婚姻状况',
  },
  height: {
    type: DataTypes.STRING(10),
    comment: '身高',
  },
  weight: {
    type: DataTypes.STRING(10),
    comment: '体重',
  },
  leftEye: {
    type: DataTypes.STRING(10),
    comment: '左眼视力',
  },
  rightEye: {
    type: DataTypes.STRING(10),
    comment: '右眼视力',
  },
  bloodType: {
    type: DataTypes.STRING(10),
    comment: '血型',
  },
  health: {
    type: DataTypes.STRING(20),
    comment: '健康状况',
  },
  education: {
    type: DataTypes.STRING(50),
    comment: '文化程度',
  },
  graduatedFrom: {
    type: DataTypes.STRING(100),
    comment: '毕业院校',
  },
  majorStudied: {
    type: DataTypes.STRING(100),
    comment: '所学专业',
  },
  specialty: {
    type: DataTypes.STRING(255),
    comment: '技术特长',
  },
  certificate: {
    type: DataTypes.STRING(100),
    comment: '职业资格证书',
  },
  certificateLevel: {
    type: DataTypes.STRING(50),
    comment: '职业资格证书等级',
  },
  isSoldier: {
    type: DataTypes.STRING(10),
    comment: '是否退役军人',
  },
  serviceUnit: {
    type: DataTypes.STRING(100),
    comment: '服役部队',
  },
  serviceYears: {
    type: DataTypes.STRING(20),
    comment: '服役年限',
  },
  hasFirefighting: {
    type: DataTypes.STRING(10),
    comment: '有无消防工作经历',
  },
  firefightingYears: {
    type: DataTypes.STRING(20),
    comment: '消防工作年限',
  },
  firefightingUnit: {
    type: DataTypes.STRING(100),
    comment: '消防工作单位',
  },
  currentEmployer: {
    type: DataTypes.STRING(100),
    comment: '现工作单位',
  },
  currentPosition: {
    type: DataTypes.STRING(100),
    comment: '现工作职务',
  },
  driverLicense: {
    type: DataTypes.STRING(50),
    comment: '准驾车型',
  },

  // 照片文件ID（关联文件表）
  photoFileId: {
    type: DataTypes.INTEGER,
    comment: '个人照片文件ID',
  },
  idCardFrontFileId: {
    type: DataTypes.INTEGER,
    comment: '身份证正面文件ID',
  },
  idCardBackFileId: {
    type: DataTypes.INTEGER,
    comment: '身份证反面文件ID',
  },

  // JSON字段存储复杂数据
  educations: {
    type: DataTypes.JSON,
    comment: '教育经历',
  },
  works: {
    type: DataTypes.JSON,
    comment: '工作经历',
  },
  families: {
    type: DataTypes.JSON,
    comment: '家庭成员',
  },
  rewards: {
    type: DataTypes.JSON,
    comment: '奖惩情况',
  },

  // 审核状态
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '审核状态',
  },
  reviewReason: {
    type: DataTypes.TEXT,
    comment: '审核意见',
  },
  nextReviewDate: {
    type: DataTypes.DATEONLY,
    comment: '下次审核日期',
  },
  nextReviewMaterials: {
    type: DataTypes.TEXT,
    comment: '需补充材料',
  },
  nextReviewLocation: {
    type: DataTypes.STRING(255),
    comment: '下次审核地点',
  },
  reviewedAt: {
    type: DataTypes.DATE,
    comment: '审核时间',
  },
  reviewedBy: {
    type: DataTypes.STRING(100),
    comment: '审核人openid',
  },

  // 提交时间
  submitTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '提交时间',
  },
}, {
  tableName: 'submissions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 建立关联关系
Submission.belongsTo(File, { as: 'photoFile', foreignKey: 'photoFileId' });
Submission.belongsTo(File, { as: 'idCardFrontFile', foreignKey: 'idCardFrontFileId' });
Submission.belongsTo(File, { as: 'idCardBackFile', foreignKey: 'idCardBackFileId' });

// 数据库初始化方法
async function init() {
  await File.sync({ alter: true });
  await Submission.sync({ alter: true });
}

// 导出初始化方法和模型
module.exports = {
  init,
  File,
  Submission,
  sequelize,
};
