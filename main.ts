// Tiny stack VM: runs each /input/<id>/program.bin on its input.bin and writes
// /output/<id>/stdout.bin + exit.txt. Semantics follow the kit ISA exactly:
// 32-bit wrapping ints, 256-value stack, 64-deep call stack, 256 words of
// memory, ten traps with their own exit codes, 1,000,000-step and 65,536-byte
// output limits. A trap keeps the output written before it.
import{mkdirSync as k,readdirSync as d,readFileSync as r,writeFileSync as w}from"node:fs";
import{join as j}from"node:path";
const I=process.env.MAKEFUN_INPUT_DIR??"/input",O=process.env.MAKEFUN_OUTPUT_DIR??"/output";
const T=new Uint8Array(256);
for(const[b,a,c,e]of[[0,0,0,0],[1,1,0,1],[2,4,0,1],[3,0,1,0],[4,0,1,2],[5,0,2,2],[6,0,2,3],[7,0,3,3],[16,0,2,1],[17,0,2,1],[18,0,2,1],[19,0,2,1],[20,0,2,1],[21,0,2,1],[22,0,2,1],[23,0,1,1],[24,0,2,1],[25,0,2,1],[26,0,2,1],[27,0,1,1],[28,0,2,1],[29,0,2,1],[30,0,2,1],[32,0,2,1],[33,0,2,1],[34,0,2,1],[48,2,0,0],[49,2,1,0],[50,2,1,0],[51,2,0,0],[52,0,0,0],[64,0,1,1],[65,0,2,0],[80,0,1,0],[81,0,1,0],[82,0,0,1],[83,0,1,0]])T[b]=1+a+(c<<3)+(e<<5);
function run(p,q){
const n=p.length,D=new Int32Array(256);let s=0;const C=new Int32Array(64);let t=0;const M=new Int32Array(256),o=new Uint8Array(65536);let l=0,g=0,x=0,v=0;
const E=e=>[o.subarray(0,l),e];
for(;;){
if(v===1e6)return E(10);
if(x<0||x>=n)return E(9);
const h=p[x],z=T[h]-1;
if(z<0)return E(5);
const m=z&7;
if(x+m>=n)return E(9);
v++;
const y=x+1+m,c=(z>>3)&3,f=(z>>5)&3;
if(s<c)return E(2);
if(s-c+f>256)return E(3);
x=y;
switch(h){
case 0:return E(0);
case 1:D[s++]=(p[y-1]<<24)>>24;break;
case 2:D[s++]=p[y-4]|p[y-3]<<8|p[y-2]<<16|p[y-1]<<24;break;
case 3:s--;break;
case 4:D[s]=D[s-1];s++;break;
case 5:{const a=D[s-1];D[s-1]=D[s-2];D[s-2]=a;break;}
case 6:D[s]=D[s-2];s++;break;
case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break;}
case 23:D[s-1]=-D[s-1]|0;break;
case 27:D[s-1]=~D[s-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
const b=D[s-1],a=D[s-2];let e;
if(h===16)e=(a+b)|0;
else if(h===17)e=(a-b)|0;
else if(h===18)e=Math.imul(a,b);
else if(h===19){if(!b)return E(4);e=a===-2147483648&&b===-1?a:(a/b)|0;}
else if(h===20){if(!b)return E(4);e=b===-1?0:(a%b)|0;}
else if(h===21){if(!b)return E(4);e=((a>>>0)/(b>>>0))|0;}
else if(h===22){if(!b)return E(4);e=((a>>>0)%(b>>>0))|0;}
else if(h===24)e=a&b;
else if(h===25)e=a|b;
else if(h===26)e=a^b;
else if(h===28)e=a<<(b&31);
else if(h===29)e=a>>(b&31);
else if(h===30)e=(a>>>(b&31))|0;
else if(h===32)e=a===b?1:0;
else if(h===33)e=a<b?1:0;
else e=(a>>>0)<(b>>>0)?1:0;
s-=2;D[s++]=e;break;}
case 48:case 49:case 50:{
const e=((p[y-2]|p[y-1]<<8)<<16)>>16;let u=1;
if(h!==48){const a=D[--s];u=h===49?a===0:a!==0;}
if(u)x=y+e;break;}
case 51:if(t===64)return E(7);C[t++]=y;x=p[y-2]|p[y-1]<<8;break;
case 52:if(!t)return E(8);x=C[--t];break;
case 64:{const a=D[s-1];if(a<0||a>255)return E(6);D[s-1]=M[a];break;}
case 65:{const a=D[s-1],u=D[s-2];if(a<0||a>255)return E(6);s-=2;M[a]=u;break;}
case 80:{const a=String(D[s-1]);if(l+a.length>65536)return E(11);s--;for(let k=0;k<a.length;k++)o[l++]=a.charCodeAt(k);break;}
case 81:if(l+1>65536)return E(11);o[l++]=D[--s]&255;break;
case 82:D[s++]=g<q.length?q[g++]:-1;break;
case 83:return E(D[--s]&255);
}}
}
for(const id of d(I).sort()){
let z=new Uint8Array(0),e=0;
try{
[z,e]=run(r(j(I,id,"program.bin")),r(j(I,id,"input.bin")));
}catch{}
k(j(O,id),{recursive:true});w(j(O,id,"stdout.bin"),z);w(j(O,id,"exit.txt"),e+"\n");
}
