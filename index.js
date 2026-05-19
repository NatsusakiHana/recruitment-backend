// 加载环境变量
require('dotenv').config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { init: initDB, Counter, File, Submission, Admin, Announcement, Banner, CompanyInfo, SystemSetting } = require("./db");
const { generateToken, adminAuth } = require("./auth");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

// ==================== 文件管理接口 ====================

// 记录文件上传信息
app.post("/api/files", async (req, res) => {
  try {
    const { fileId, fileName, fileType, fileSize, uploadBy } = req.body;

    if (!fileId || !fileName || !fileType || !uploadBy) {
      return res.status(400).send({
        code: -1,
        message: "缺少必要参数",
      });
    }

    const file = await File.create({
      fileId,
      fileName,
      fileType,
      fileSize: fileSize || 0,
      uploadBy,
      uploadAt: new Date(),
    });

    res.send({
      code: 0,
      data: file,
      message: "文件记录创建成功",
    });
  } catch (error) {
    console.error("创建文件记录失败：", error);
    res.status(500).send({
      code: -1,
      message: "创建文件记录失败",
      error: error.message,
    });
  }
});

// 获取文件信息
app.get("/api/files/:id", async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);

    if (!file) {
      return res.status(404).send({
        code: -1,
        message: "文件不存在",
      });
    }

    res.send({
      code: 0,
      data: file,
    });
  } catch (error) {
    console.error("获取文件信息失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取文件信息失败",
      error: error.message,
    });
  }
});

// ==================== 报名管理接口 ====================

// 创建报名
app.post("/api/submissions", async (req, res) => {
  try {
    const openid = req.headers["x-wx-openid"];

    if (!openid) {
      return res.status(401).send({
        code: -1,
        message: "未授权，缺少openid",
      });
    }

    const { formData, fileIds } = req.body;

    if (!formData || !formData.step1) {
      return res.status(400).send({
        code: -1,
        message: "缺少表单数据",
      });
    }

    // 检查是否已经提交过
    const existingSubmission = await Submission.findOne({
      where: { openid },
    });

    if (existingSubmission) {
      return res.status(400).send({
        code: -1,
        message: "您已经提交过报名，不能重复提交",
      });
    }

    const step1 = formData.step1;

    // 创建报名记录
    const submission = await Submission.create({
      openid,
      // 基本信息
      position: step1.position,
      name: step1.name,
      formerName: step1.formerName,
      phone: step1.phone,
      email: step1.email,
      gender: step1.gender,
      birthDate: step1.birthDate,
      nation: step1.nation,
      nativePlace: step1.nativePlace,
      familyOrigin: step1.familyOrigin,
      religion: step1.religion,
      politicalStatus: step1.politicalStatus,
      partyTime: step1.partyTime,
      idCard: step1.idCard,
      registeredAddress: step1.registeredAddress,
      currentAddress: step1.currentAddress,
      mailAddress: step1.mailAddress,
      zipCode: step1.zipCode,
      domicile: step1.domicile,
      maritalStatus: step1.maritalStatus,
      height: step1.height,
      weight: step1.weight,
      leftEye: step1.leftEye,
      rightEye: step1.rightEye,
      bloodType: step1.bloodType,
      health: step1.health,
      education: step1.education,
      graduatedFrom: step1.graduatedFrom,
      majorStudied: step1.majorStudied,
      specialty: step1.specialty,
      certificate: step1.certificate,
      certificateLevel: step1.certificateLevel,
      isSoldier: step1.isSoldier,
      serviceUnit: step1.serviceUnit,
      serviceYears: step1.serviceYears,
      hasFirefighting: step1.hasFirefighting,
      firefightingYears: step1.firefightingYears,
      firefightingUnit: step1.firefightingUnit,
      currentEmployer: step1.currentEmployer,
      currentPosition: step1.currentPosition,
      driverLicense: step1.driverLicense,

      // 文件ID
      photoFileId: fileIds?.photoFileId,
      idCardFrontFileId: fileIds?.idCardFrontFileId,
      idCardBackFileId: fileIds?.idCardBackFileId,

      // JSON数据
      educations: formData.step2?.educations || [],
      works: formData.step3?.works || [],
      families: formData.step4?.families || [],
      rewards: formData.step5?.rewards || [],

      // 状态
      status: 'pending',
      submitTime: new Date(),
    });

    res.send({
      code: 0,
      data: submission,
      message: "报名提交成功",
    });
  } catch (error) {
    console.error("创建报名失败：", error);
    res.status(500).send({
      code: -1,
      message: "报名提交失败",
      error: error.message,
    });
  }
});

// 获取我的报名信息
app.get("/api/submissions/my", async (req, res) => {
  try {
    const openid = req.headers["x-wx-openid"];

    if (!openid) {
      return res.status(401).send({
        code: -1,
        message: "未授权，缺少openid",
      });
    }

    const submission = await Submission.findOne({
      where: { openid },
      include: [
        { model: File, as: 'photoFile' },
        { model: File, as: 'idCardFrontFile' },
        { model: File, as: 'idCardBackFile' },
      ],
    });

    if (!submission) {
      return res.send({
        code: 0,
        data: null,
        message: "暂无报名记录",
      });
    }

    res.send({
      code: 0,
      data: submission,
    });
  } catch (error) {
    console.error("获取报名信息失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取报名信息失败",
      error: error.message,
    });
  }
});

// 获取报名列表（管理员）
app.get("/api/submissions", async (req, res) => {
  try {
    const { status, page = 1, pageSize = 20, keyword } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (keyword) {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { idCard: { [Op.like]: `%${keyword}%` } },
        { position: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await Submission.findAndCountAll({
      where,
      include: [
        { model: File, as: 'photoFile' },
        { model: File, as: 'idCardFrontFile' },
        { model: File, as: 'idCardBackFile' },
      ],
      order: [['submitTime', 'DESC']],
      offset,
      limit,
    });

    res.send({
      code: 0,
      data: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: rows,
      },
    });
  } catch (error) {
    console.error("获取报名列表失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取报名列表失败",
      error: error.message,
    });
  }
});

// 获取单个报名详情
app.get("/api/submissions/:id", async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id, {
      include: [
        { model: File, as: 'photoFile' },
        { model: File, as: 'idCardFrontFile' },
        { model: File, as: 'idCardBackFile' },
      ],
    });

    if (!submission) {
      return res.status(404).send({
        code: -1,
        message: "报名记录不存在",
      });
    }

    res.send({
      code: 0,
      data: submission,
    });
  } catch (error) {
    console.error("获取报名详情失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取报名详情失败",
      error: error.message,
    });
  }
});

// 审核报名
app.put("/api/submissions/:id/review", async (req, res) => {
  try {
    const openid = req.headers["x-wx-openid"];

    if (!openid) {
      return res.status(401).send({
        code: -1,
        message: "未授权，缺少openid",
      });
    }

    const { status, reviewReason, nextReviewDate, nextReviewMaterials, nextReviewLocation } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).send({
        code: -1,
        message: "审核状态无效",
      });
    }

    const submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).send({
        code: -1,
        message: "报名记录不存在",
      });
    }

    await submission.update({
      status,
      reviewReason,
      nextReviewDate,
      nextReviewMaterials,
      nextReviewLocation,
      reviewedAt: new Date(),
      reviewedBy: openid,
    });

    res.send({
      code: 0,
      data: submission,
      message: "审核成功",
    });
  } catch (error) {
    console.error("审核失败：", error);
    res.status(500).send({
      code: -1,
      message: "审核失败",
      error: error.message,
    });
  }
});

// ==================== 管理员认证接口 ====================

// 管理员登录
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({
        code: -1,
        message: "用户名和密码不能为空",
      });
    }

    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      return res.status(401).send({
        code: -1,
        message: "用户名或密码错误",
      });
    }

    // 检查账号状态
    if (admin.status !== 'active') {
      return res.status(403).send({
        code: -1,
        message: "账号已被禁用",
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).send({
        code: -1,
        message: "用户名或密码错误",
      });
    }

    // 更新最后登录时间
    await admin.update({ lastLoginAt: new Date() });

    // 生成Token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    res.send({
      code: 0,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          realName: admin.realName,
          role: admin.role,
          email: admin.email,
          phone: admin.phone,
        },
      },
      message: "登录成功",
    });
  } catch (error) {
    console.error("登录失败：", error);
    res.status(500).send({
      code: -1,
      message: "登录失败",
      error: error.message,
    });
  }
});

// 获取当前管理员信息
app.get("/api/admin/profile", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: { exclude: ['password'] },
    });

    if (!admin) {
      return res.status(404).send({
        code: -1,
        message: "管理员不存在",
      });
    }

    res.send({
      code: 0,
      data: admin,
    });
  } catch (error) {
    console.error("获取管理员信息失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取管理员信息失败",
      error: error.message,
    });
  }
});

// 管理员登出
app.post("/api/admin/logout", adminAuth, async (req, res) => {
  res.send({
    code: 0,
    message: "登出成功",
  });
});

// ==================== 通知公告管理接口 ====================

// 获取公告列表
app.get("/api/announcements", async (req, res) => {
  try {
    const { type, status, page = 1, pageSize = 20, keyword } = req.query;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (keyword) {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { content: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      include: [{ model: Admin, as: 'creator', attributes: ['id', 'username', 'realName'] }],
      order: [['isTop', 'DESC'], ['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      offset,
      limit,
    });

    res.send({
      code: 0,
      data: {
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        list: rows,
      },
    });
  } catch (error) {
    console.error("获取公告列表失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取公告列表失败",
      error: error.message,
    });
  }
});

// 获取公告详情
app.get("/api/announcements/:id", async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [{ model: Admin, as: 'creator', attributes: ['id', 'username', 'realName'] }],
    });

    if (!announcement) {
      return res.status(404).send({
        code: -1,
        message: "公告不存在",
      });
    }

    // 增加浏览次数
    await announcement.increment('viewCount');

    res.send({
      code: 0,
      data: announcement,
    });
  } catch (error) {
    console.error("获取公告详情失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取公告详情失败",
      error: error.message,
    });
  }
});

// 创建公告（需要管理员权限）
app.post("/api/announcements", adminAuth, async (req, res) => {
  try {
    const { title, content, type, isTop, status } = req.body;

    if (!title || !content) {
      return res.status(400).send({
        code: -1,
        message: "标题和内容不能为空",
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      type: type || 'notice',
      isTop: isTop || false,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null,
      createdBy: req.admin.id,
    });

    res.send({
      code: 0,
      data: announcement,
      message: "创建成功",
    });
  } catch (error) {
    console.error("创建公告失败：", error);
    res.status(500).send({
      code: -1,
      message: "创建公告失败",
      error: error.message,
    });
  }
});

// 更新公告（需要管理员权限）
app.put("/api/announcements/:id", adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).send({
        code: -1,
        message: "公告不存在",
      });
    }

    const { title, content, type, isTop, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (isTop !== undefined) updateData.isTop = isTop;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published' && !announcement.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    await announcement.update(updateData);

    res.send({
      code: 0,
      data: announcement,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新公告失败：", error);
    res.status(500).send({
      code: -1,
      message: "更新公告失败",
      error: error.message,
    });
  }
});

// 删除公告（需要管理员权限）
app.delete("/api/announcements/:id", adminAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).send({
        code: -1,
        message: "公告不存在",
      });
    }

    await announcement.destroy();

    res.send({
      code: 0,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除公告失败：", error);
    res.status(500).send({
      code: -1,
      message: "删除公告失败",
      error: error.message,
    });
  }
});

// ==================== 轮播图管理接口 ====================

// 获取轮播图列表
app.get("/api/banners", async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const banners = await Banner.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    res.send({
      code: 0,
      data: banners,
    });
  } catch (error) {
    console.error("获取轮播图列表失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取轮播图列表失败",
      error: error.message,
    });
  }
});

// 创建轮播图（需要管理员权限）
app.post("/api/banners", adminAuth, async (req, res) => {
  try {
    const { title, imageUrl, linkUrl, sortOrder, status } = req.body;

    if (!imageUrl) {
      return res.status(400).send({
        code: -1,
        message: "图片URL不能为空",
      });
    }

    const banner = await Banner.create({
      title,
      imageUrl,
      linkUrl,
      sortOrder: sortOrder || 0,
      status: status || 'active',
    });

    res.send({
      code: 0,
      data: banner,
      message: "创建成功",
    });
  } catch (error) {
    console.error("创建轮播图失败：", error);
    res.status(500).send({
      code: -1,
      message: "创建轮播图失败",
      error: error.message,
    });
  }
});

// 更新轮播图（需要管理员权限）
app.put("/api/banners/:id", adminAuth, async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).send({
        code: -1,
        message: "轮播图不存在",
      });
    }

    const { title, imageUrl, linkUrl, sortOrder, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (status !== undefined) updateData.status = status;

    await banner.update(updateData);

    res.send({
      code: 0,
      data: banner,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新轮播图失败：", error);
    res.status(500).send({
      code: -1,
      message: "更新轮播图失败",
      error: error.message,
    });
  }
});

// 删除轮播图（需要管理员权限）
app.delete("/api/banners/:id", adminAuth, async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).send({
        code: -1,
        message: "轮播图不存在",
      });
    }

    await banner.destroy();

    res.send({
      code: 0,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除轮播图失败：", error);
    res.status(500).send({
      code: -1,
      message: "删除轮播图失败",
      error: error.message,
    });
  }
});

// ==================== 单位简介管理接口 ====================

// 获取单位简介
app.get("/api/company-info", async (req, res) => {
  try {
    const info = await CompanyInfo.findOne({
      include: [{ model: Admin, as: 'updater', attributes: ['id', 'username', 'realName'] }],
      order: [['updatedAt', 'DESC']],
    });

    res.send({
      code: 0,
      data: info,
    });
  } catch (error) {
    console.error("获取单位简介失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取单位简介失败",
      error: error.message,
    });
  }
});

// 更新单位简介（需要管理员权限）
app.put("/api/company-info", adminAuth, async (req, res) => {
  try {
    const { content, images } = req.body;

    if (!content) {
      return res.status(400).send({
        code: -1,
        message: "内容不能为空",
      });
    }

    // 查找现有记录
    let info = await CompanyInfo.findOne();

    if (info) {
      // 更新现有记录
      await info.update({
        content,
        images,
        updatedBy: req.admin.id,
      });
    } else {
      // 创建新记录
      info = await CompanyInfo.create({
        content,
        images,
        updatedBy: req.admin.id,
      });
    }

    res.send({
      code: 0,
      data: info,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新单位简介失败：", error);
    res.status(500).send({
      code: -1,
      message: "更新单位简介失败",
      error: error.message,
    });
  }
});

// ==================== 系统设置接口 ====================

// 获取系统设置
app.get("/api/settings", adminAuth, async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();

    // 转换为键值对对象
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.send({
      code: 0,
      data: settingsObj,
    });
  } catch (error) {
    console.error("获取系统设置失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取系统设置失败",
      error: error.message,
    });
  }
});

// 更新系统设置（需要管理员权限）
app.put("/api/settings", adminAuth, async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await SystemSetting.upsert({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
      });
    }

    res.send({
      code: 0,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新系统设置失败：", error);
    res.status(500).send({
      code: -1,
      message: "更新系统设置失败",
      error: error.message,
    });
  }
});

// ==================== 统计数据接口 ====================

// 获取仪表盘统计数据
app.get("/api/dashboard/stats", adminAuth, async (req, res) => {
  try {
    const totalSubmissions = await Submission.count();
    const pendingSubmissions = await Submission.count({ where: { status: 'pending' } });
    const approvedSubmissions = await Submission.count({ where: { status: 'approved' } });
    const rejectedSubmissions = await Submission.count({ where: { status: 'rejected' } });

    res.send({
      code: 0,
      data: {
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
      },
    });
  } catch (error) {
    console.error("获取统计数据失败：", error);
    res.status(500).send({
      code: -1,
      message: "获取统计数据失败",
      error: error.message,
    });
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
