// 加载环境变量
require('dotenv').config();

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

// 管理员表
const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名',
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码（加密）',
  },
  realName: {
    type: DataTypes.STRING(50),
    comment: '真实姓名',
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '手机号',
  },
  email: {
    type: DataTypes.STRING(100),
    comment: '邮箱',
  },
  role: {
    type: DataTypes.ENUM('admin', 'super_admin'),
    allowNull: false,
    defaultValue: 'admin',
    comment: '角色',
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态',
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    comment: '最后登录时间',
  },
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 通知公告表
const Announcement = sequelize.define("Announcement", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '内容',
  },
  type: {
    type: DataTypes.ENUM('notice', 'announcement'),
    allowNull: false,
    defaultValue: 'notice',
    comment: '类型：notice-通知，announcement-公告',
  },
  isTop: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否置顶',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    allowNull: false,
    defaultValue: 'draft',
    comment: '状态',
  },
  publishedAt: {
    type: DataTypes.DATE,
    comment: '发布时间',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    comment: '创建人ID',
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览次数',
  },
}, {
  tableName: 'announcements',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 轮播图表
const Banner = sequelize.define("Banner", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    comment: '标题',
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '图片URL',
  },
  linkUrl: {
    type: DataTypes.STRING(500),
    comment: '链接URL',
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态',
  },
}, {
  tableName: 'banners',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 单位简介表
const CompanyInfo = sequelize.define("CompanyInfo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '简介内容',
  },
  images: {
    type: DataTypes.JSON,
    comment: '图片列表',
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    comment: '更新人ID',
  },
}, {
  tableName: 'company_info',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 系统设置表
const SystemSetting = sequelize.define("SystemSetting", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '设置键',
  },
  value: {
    type: DataTypes.TEXT,
    comment: '设置值',
  },
  description: {
    type: DataTypes.STRING(255),
    comment: '描述',
  },
}, {
  tableName: 'system_settings',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

// 建立关联关系
Submission.belongsTo(File, { as: 'photoFile', foreignKey: 'photoFileId' });
Submission.belongsTo(File, { as: 'idCardFrontFile', foreignKey: 'idCardFrontFileId' });
Submission.belongsTo(File, { as: 'idCardBackFile', foreignKey: 'idCardBackFileId' });

Announcement.belongsTo(Admin, { as: 'creator', foreignKey: 'createdBy' });
CompanyInfo.belongsTo(Admin, { as: 'updater', foreignKey: 'updatedBy' });

// 数据库初始化方法
async function init() {
  await File.sync({ alter: true });
  await Submission.sync({ alter: true });
  await Admin.sync({ alter: true });
  await Announcement.sync({ alter: true });
  await Banner.sync({ alter: true });
  await CompanyInfo.sync({ alter: true });
  await SystemSetting.sync({ alter: true });

  // 创建默认管理员账号（如果不存在）
  const bcrypt = require('bcryptjs');
  const adminCount = await Admin.count();
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      role: 'super_admin',
      status: 'active',
    });
    console.log('默认管理员账号已创建：admin / admin123');
  }
}

// 导出初始化方法和模型
module.exports = {
  init,
  File,
  Submission,
  Admin,
  Announcement,
  Banner,
  CompanyInfo,
  SystemSetting,
  sequelize,
};
