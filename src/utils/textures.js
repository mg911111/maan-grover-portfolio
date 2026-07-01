import * as THREE from "three";

export function createWaterTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1d5268";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 2200; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 40 + Math.random() * 80;
    const h = 2 + Math.random() * 6;
    ctx.fillStyle = "rgba(180, 207, 205, 0.12)";
    ctx.fillRect(x, y, w, h);
  }

  for (let i = 0; i < 1200; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 0.8 + Math.random() * 2;
    ctx.fillStyle = "rgba(185,210,210,0.08)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.anisotropy = 8;
  return texture;
}

export function createTireMarkTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(40, 0, 24, size);
  ctx.fillRect(192, 0, 24, size);

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = 0; i < 120; i += 1) {
    const x = 30 + Math.random() * 200;
    const y = Math.random() * size;
    ctx.fillRect(x, y, 10 + Math.random() * 16, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 4;
  return texture;
}
