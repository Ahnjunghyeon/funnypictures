import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

console.log("Supabase URL:", supabaseUrl); // undefined인지 확인
console.log("Supabase Key:", supabaseKey); // undefined인지 확인

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/images")
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("transformed_images")
        .select("*");
      if (error) console.error(error);
      else setImages((prevImages) => [...prevImages, ...data]);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>변환된 사진 리스트</h1>
      {images.map((img) => (
        <div key={img.id}>
          <img src={img.transformed_image_url} alt="Transformed" width="300" />
        </div>
      ))}
    </div>
  );
}

export default App;
