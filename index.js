const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter, File, Submission } = require("./db");

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

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
