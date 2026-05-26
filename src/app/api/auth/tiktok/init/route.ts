import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accessToken, caption, videoSize, videoType } = body;

    if (!accessToken || !caption || !videoSize) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Panggil API TikTok dari sisi server untuk menghindari CORS
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: caption,
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000,
          },
          source_info: {
            source: "FILE_UPLOAD",
            video_size: videoSize,
            chunk_size: videoSize, // 1 Chunk langsung untuk video di bawah 64MB
            total_chunk_count: 1,
          },
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error TikTok Init Route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}