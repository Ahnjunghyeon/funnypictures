require("dotenv").config(); // dotenv 로드

const { createClient } = require("@supabase/supabase-js");

// 필수 패키지 불러오기
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 환경 변수 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Supabase 클라이언트 설정
const supabase = createClient(supabaseUrl, supabaseKey);

// Express 서버 설정
const app = express();
const port = 5000;

// CORS 설정 (모든 출처에서 요청 허용)
app.use(cors());

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // 파일을 'uploads' 폴더에 저장
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일 이름을 현재 시간으로 설정
  },
});

const upload = multer({ storage });

// 'uploads' 폴더 존재하지 않으면 생성
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// API 엔드포인트 설정
// 이미지 업로드 API (파일을 업로드하고 Supabase에 저장)
app.post("/upload", upload.single("image"), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).send("이미지를 업로드해주세요.");
  }

  try {
    // 이미지 변환 및 저장 (여기서는 예시로 로컬에 저장된 이미지 URL을 사용)
    const transformedImageUrl = `http://localhost:5000/uploads/${file.filename}`;

    // Supabase에 변환된 이미지 URL 저장
    const { data, error } = await supabase
      .from("transformed_images")
      .insert([{ transformed_image_url: transformedImageUrl }]);

    if (error) {
      return res.status(500).send(error.message);
    }

    // 저장 후 클라이언트에게 변환된 이미지 URL 응답
    res.status(200).send({
      message: "이미지 업로드 성공!",
      transformed_image_url: transformedImageUrl,
    });
  } catch (error) {
    res.status(500).send("서버 오류: " + error.message);
  }
});

// 변환된 이미지 리스트 가져오기 API
app.get("/images", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transformed_images")
      .select("*");
    if (error) {
      return res.status(500).send(error.message);
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("서버 오류: " + error.message);
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
