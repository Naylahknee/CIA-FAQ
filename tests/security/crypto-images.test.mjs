import test from 'node:test';
import assert from 'node:assert/strict';
import {totp, matchingStep, seal, unseal, base32} from '../../app/security-crypto.ts';
import {stripImageMetadata} from '../../app/image-metadata.ts';
import {pbkdf2Sync} from 'node:crypto';
import {hashPassword, verifyPassword} from '../../app/password-security.ts';
test('TOTP RFC 6238 vector, expiry and malformed code rejection',()=>{
 const secret=Buffer.from('12345678901234567890').toString('hex');
 assert.equal(totp(secret,1),'287082');assert.equal(matchingStep(secret,'287082',59000),1);
 assert.equal(matchingStep(secret,'287082',180000),-1);assert.equal(matchingStep(secret,'x'),-1);
 assert.equal(base32(Buffer.from('foo')),'MZXW6');
});
test('encrypted authenticator secret binds to account and rejects tampering',async()=>{
 const key='a'.repeat(64);const encrypted=await seal('private-secret',key,'user1');
 assert.equal(await unseal(encrypted,key,'user1'),'private-secret');
 await assert.rejects(unseal(encrypted,key,'user2'));await assert.rejects(unseal(encrypted,'b'.repeat(64),'user1'));
 await assert.rejects(seal('test','','user1'));
});
test('password verification accepts legacy hashes and current hashes', async()=>{
 const password='correct horse battery staple';const legacySalt='legacy-salt-value';
 const legacyHash=pbkdf2Sync(password,legacySalt,210000,32,'sha256').toString('hex');
 assert.equal(await verifyPassword(password,legacySalt,legacyHash,210000),true);
 assert.equal(await verifyPassword('wrong',legacySalt,legacyHash,210000),false);
 const current=await hashPassword(password);
 assert.equal(await verifyPassword(password,current.salt,current.hash,current.iterations),true);
});
test('JPEG strips EXIF GPS and trailing bytes, preserves scan data',()=>{
 const jpeg=Buffer.from([255,216,255,225,0,10,...Buffer.from('GPS-data'),255,218,0,2,1,2,3,255,217,9]);
 const clean=stripImageMetadata(jpeg,'image/jpeg');assert.equal(Buffer.from(clean).includes(Buffer.from('GPS-data')),false);
 assert.deepEqual([...clean],[255,216,255,218,0,2,1,2,3,255,217]);
 assert.throws(()=>stripImageMetadata(jpeg.subarray(0,10),'image/jpeg'));
});
test('PNG removes textual metadata and EXIF chunks',()=>{
 const chunk=(name,payload)=>{const b=Buffer.alloc(payload.length+12);b.writeUInt32BE(payload.length);b.write(name,4);payload.copy(b,8);return b;};
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',Buffer.alloc(13)),chunk('eXIf',Buffer.from('GPS')),chunk('tEXt',Buffer.from('location')),chunk('IDAT',Buffer.from([1])),chunk('IEND',Buffer.alloc(0))]);
 const clean=Buffer.from(stripImageMetadata(png,'image/png'));assert.equal(clean.includes(Buffer.from('GPS')),false);assert.equal(clean.includes(Buffer.from('location')),false);assert.ok(clean.includes(Buffer.from('IDAT')));
});
test('GIF strips comment and trailing metadata while retaining pixels',()=>{
 const gif=Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==','base64');
 const modified=Buffer.concat([gif.subarray(0,19),Buffer.from([0x21,0xfe,3,71,80,83,0]),gif.subarray(19),Buffer.from('GPS')]);
 const clean=Buffer.from(stripImageMetadata(modified,'image/gif'));assert.equal(clean.includes(Buffer.from('GPS')),false);assert.deepEqual(clean,gif);
});
test('WebP drops EXIF and repairs container size',()=>{
 const chunk=(name,payload)=>{const b=Buffer.alloc(8+payload.length+payload.length%2);b.write(name);b.writeUInt32LE(payload.length,4);payload.copy(b,8);return b;};
 const chunks=Buffer.concat([chunk('VP8 ',Buffer.from('pixels')),chunk('EXIF',Buffer.from('GPS'))]);const h=Buffer.from('RIFF0000WEBP');h.writeUInt32LE(chunks.length+4,4);
 const clean=Buffer.from(stripImageMetadata(Buffer.concat([h,chunks]),'image/webp'));assert.equal(clean.includes(Buffer.from('GPS')),false);assert.equal(clean.readUInt32LE(4),clean.length-8);
});
