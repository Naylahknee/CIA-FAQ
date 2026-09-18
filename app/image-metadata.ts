// Keep only image-rendering segments. Unknown metadata is discarded, never stored.
export function stripImageMetadata(input:Uint8Array, type:string):Uint8Array {
 const b=Buffer.from(input); const parts:Buffer[]=[];
 const bad=()=>{throw new Error('Malformed or unsupported image');};
 if(type==='image/jpeg') {
  if(b.readUInt16BE(0)!==0xffd8) return bad(); parts.push(b.subarray(0,2));
  let i=2;
  while(i<b.length) {
   const start=i; if(b[i++]!==255)return bad(); while(b[i]===255)i++;
   const marker=b[i++];
   if(marker===0xd9){parts.push(Buffer.from([255,217]));return Buffer.concat(parts);}
   if(marker===0 || marker===0xd8 || (marker>=0xd0&&marker<=0xd7))return bad();
   if(i+2>b.length)return bad();const length=b.readUInt16BE(i);if(length<2||i+length>b.length)return bad();
   const end=i+length;
   // Drop APP0–APP15 and COM (EXIF, GPS, XMP, thumbnails, comments).
   if(!((marker>=0xe0&&marker<=0xef)||marker===0xfe))parts.push(b.subarray(start,end));
   i=end;
   if(marker===0xda){
    const scan=i;
    while(i<b.length){if(b[i]!==255){i++;continue;}let j=i+1;while(b[j]===255)j++;if(b[j]===0||(b[j]>=0xd0&&b[j]<=0xd7)){i=j+1;continue;}break;}
    parts.push(b.subarray(scan,i));
   }
  }
  return bad();
 }
 if(type==='image/png') {
  if(!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return bad();parts.push(b.subarray(0,8));
  let i=8; let seenHeader=false,seenData=false;
  const keep=new Set(['IHDR','PLTE','IDAT','IEND','tRNS','gAMA','cHRM','sRGB','acTL','fcTL','fdAT']);
  while(i+12<=b.length){const n=b.readUInt32BE(i),end=i+12+n;if(end>b.length)return bad();const tag=b.toString('ascii',i+4,i+8);
   if(!seenHeader && tag!=='IHDR')return bad(); if(tag==='IHDR'){if(seenHeader||n!==13)return bad();seenHeader=true;}
   if(tag==='IDAT')seenData=true;
   if(keep.has(tag))parts.push(b.subarray(i,end));else if(tag[0]===tag[0].toUpperCase())return bad();
   i=end;if(tag==='IEND'){if(n!==0||!seenData)return bad();return Buffer.concat(parts);}
  }return bad();
 }
 if(type==='image/webp') {
  if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP'||b.readUInt32LE(4)+8!==b.length)return bad();
  const keep=new Set(['VP8 ','VP8L','VP8X','ALPH','ANIM','ANMF']);let i=12;let image=false;
  while(i+8<=b.length){const tag=b.toString('ascii',i,i+4),n=b.readUInt32LE(i+4),end=i+8+n+(n%2);if(end>b.length)return bad();
   if(keep.has(tag)){const chunk=Buffer.from(b.subarray(i,end));if(tag==='VP8X'){if(n!==10)return bad();chunk[8]&=~(0x20|0x08|0x04);}parts.push(chunk);}
   if(['VP8 ','VP8L','ANMF'].includes(tag))image=true;i=end;
  }if(i!==b.length||!image)return bad();const body=Buffer.concat(parts);const header=Buffer.from('RIFF0000WEBP');header.writeUInt32LE(body.length+4,4);return Buffer.concat([header,body]);
 }
 if(type==='image/gif') {
  if(!['GIF87a','GIF89a'].includes(b.toString('ascii',0,6))||b.length<13)return bad();
  let i=13+((b[10]&128)?3*(2**((b[10]&7)+1)):0);if(i>b.length)return bad();parts.push(b.subarray(0,i));let image=false;
  function blocks(){while(i<b.length){const n=b[i++];if(n===0)return;if(i+n>b.length)return bad();i+=n;}return bad();}
  while(i<b.length){const start=i;const tag=b[i++];
   if(tag===0x3b){if(!image)return bad();parts.push(b.subarray(start,i));return Buffer.concat(parts);}
   if(tag===0x2c){if(i+9>b.length)return bad();const packed=b[i+8];i+=9;if(packed&128)i+=3*(2**((packed&7)+1));if(i>=b.length)return bad();i++;blocks();parts.push(b.subarray(start,i));image=true;}
   else if(tag===0x21){if(i>=b.length)return bad();const kind=b[i++];blocks();if(kind===0xf9){if(i-start!==8||b[start+2]!==4)return bad();parts.push(b.subarray(start,i));}
    // Preserve only the fixed, standard animation-loop extension.
    if(kind===0xff && i-start===19 && b.toString('ascii',start+3,start+14)==='NETSCAPE2.0' && b[start+14]===3 && b[start+15]===1)parts.push(b.subarray(start,i));
   }else return bad();
  }return bad();
 }
 return bad();
}
