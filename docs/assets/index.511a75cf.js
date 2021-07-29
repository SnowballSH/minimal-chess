var e,t,o,s,i,l,r,n,a,h;function c(e){return e>=0&&e<12}function u(e,t){return e>>2==t>>2}function d(e,t){return 1===Math.abs((e>>2)-(t>>2))}class p{constructor(){this.colorToMove=r.Yellow,this.history=[],this.status=o.OnGoing,this.pool=[],this.hashTable=[],this.hash=0,this.movesSinceLastCapture=0,this.board=[new v(i.Xiang,r.Yellow),null,null,new v(i.Jiang,r.Blue),new v(i.Wang,r.Yellow),new v(i.Zi,r.Yellow),new v(i.Zi,r.Blue),new v(i.Wang,r.Blue),new v(i.Jiang,r.Yellow),null,null,new v(i.Xiang,r.Blue)];for(let e=0;e<22;e++)this.hashTable[e]=crypto.getRandomValues(new Uint32Array(10));this.hashTableOther=crypto.getRandomValues(new Uint32Array(2)),this.calculateHash()}static fromFEN(e){const[t,o,s,i]=e.split(" ");let l=[];for(const a of t){let e=parseInt(a);isNaN(e)?l.push(null):l.push(new v(e%5,Math.floor(e/5)))}let r=[];for(const a of o){let e=parseInt(a);r.push(new v(e%5,Math.floor(e/5)))}let n=new p;n.board=l,n.pool=r,n.colorToMove=parseInt(s[0]),n.status=parseInt(s[1]),n.movesSinceLastCapture=parseInt(i);for(let a=0;a<22;a++)n.hashTable[a]=crypto.getRandomValues(new Uint32Array(10));return n.hashTableOther=crypto.getRandomValues(new Uint32Array(2)),n.calculateHash(),n}toFEN(){let e="";return e+=this.board.map((e=>null===e?"*":(e.type+5*e.color).toString())).join(""),e+=" ",e+=this.pool.filter((e=>void 0!==e)).map((e=>(e.type+5*e.color).toString())).join(""),e+=" ",e+=this.colorToMove,e+=this.status,e+=" ",e+=this.movesSinceLastCapture,e}calculateHash(){this.hash=0;for(const[e,t]of this.board.entries())null!=t&&(this.hash^=this.hashTable[e][t.type+5*t.color]);for(const[e,t]of this.pool.entries())this.hash^=this.hashTable[e+12][t.type+5*t.color];this.hash^=this.hashTableOther[this.colorToMove]}*piecesForColor(e){var t;for(const o of this.board.entries())e===(null==(t=o[1])?void 0:t.color)&&(yield o)}*emptySquares(){for(const e of this.board.entries())null===e[1]&&(yield e)}isMyPieceOnIndex(e,t){var o;return(null==(o=this.board[t])?void 0:o.color)===e}isOpponentPieceOnIndex(e,t){var o;return(null==(o=this.board[t])?void 0:o.color)===(1^e)}makeMove(t){if(this.history.push({board:[...this.board],status:this.status,pool:[...this.pool],msc:this.movesSinceLastCapture}),t.flag===e.Revive)this.board[t.to]=this.pool[t.from-12],delete this.pool[t.from-12],this.pool=this.pool.filter((e=>void 0!==e)).sort(((e,t)=>e.color-t.color));else{const s=this.board[t.from];if(this.board[t.from]=null,t.flag===e.Capture){const e=Object.create(this.board[t.to]);this.board[t.to]=s,e.type===i.Wang&&this.status===o.OnGoing?this.status=e.color===r.Yellow?o.BlueWin:o.YellowWin:(e.color^=1,e.type===i.Hou?this.pool.push(new v(i.Zi,e.color)):this.pool.push(e))}else if(t.flag===e.CapturePromotion){const e=Object.create(this.board[t.to]);this.board[t.to]=null!==s?new v(i.Hou,s.color):null,e.type===i.Wang&&this.status===o.OnGoing?this.status=e.color===r.Yellow?o.BlueWin:o.YellowWin:(e.color^=1,this.pool.push(e))}else t.flag===e.QuietPromotion?this.board[t.to]=null!==s?new v(i.Hou,s.color):null:t.flag===e.Quiet&&(this.board[t.to]=s)}this.colorToMove^=1,this.calculateHash(),t.flag===e.Capture?this.movesSinceLastCapture=0:this.movesSinceLastCapture++,this.status===o.OnGoing&&this.movesSinceLastCapture>=20&&(this.status=o.Draw)}nullMove(){this.history.push({board:[...this.board],status:this.status,pool:[...this.pool],msc:this.movesSinceLastCapture}),this.colorToMove^=1,this.calculateHash()}undoMove(){const e=this.history.pop();this.board=e.board,this.status=e.status,this.pool=e.pool,this.colorToMove^=1,this.movesSinceLastCapture=e.msc,this.calculateHash()}*legalMoves(t){let o=void 0===t?this.piecesForColor(this.colorToMove):Array.from(this.piecesForColor(this.colorToMove)).filter((e=>{var o;return t(null==(o=e[1])?void 0:o.type)}));for(const[s,l]of o)if(null!==l)for(const t of l.pieceDirections()){let o,r;switch(t){case a.N:o=s-4,c(o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.S:o=s+4,c(o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.W:o=s-1,c(o)&&u(s,o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.E:o=s+1,c(o)&&u(s,o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.NW:o=s-5,c(o)&&d(s,o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.NE:o=s-3,c(o)&&d(s,o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.SW:o=s+3,c(o)&&d(s,o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o));break;case a.SE:o=s+5,c(o)&&d(s,o)&&!this.isMyPieceOnIndex(l.color,o)&&(r=new f(s,o))}void 0!==r&&(this.isOpponentPieceOnIndex(this.colorToMove,r.to)&&(r.flag=e.Capture),l.type!==i.Zi||r.to%4!=0&&r.to%4!=3||(r.flag===e.Capture?r.flag=e.CapturePromotion:r.flag=e.QuietPromotion),yield r)}for(const[s,i]of this.pool.entries())if(void 0!==i&&i.color===this.colorToMove)for(const[t]of this.emptySquares())yield new f(12+s,t,e.Revive)}}(t=e||(e={}))[t.CapturePromotion=0]="CapturePromotion",t[t.QuietPromotion=1]="QuietPromotion",t[t.Capture=2]="Capture",t[t.Revive=3]="Revive",t[t.Quiet=4]="Quiet",(s=o||(o={}))[s.OnGoing=0]="OnGoing",s[s.YellowWin=1]="YellowWin",s[s.BlueWin=2]="BlueWin",s[s.Draw=3]="Draw";class f{constructor(e,t,o=4){this.from=e,this.to=t,this.flag=o}}(l=i||(i={}))[l.Jiang=0]="Jiang",l[l.Wang=1]="Wang",l[l.Xiang=2]="Xiang",l[l.Zi=3]="Zi",l[l.Hou=4]="Hou",(n=r||(r={}))[n.Yellow=0]="Yellow",n[n.Blue=1]="Blue";class v{constructor(e,t){this.type=e,this.color=t}pieceDirections(){const e=this;switch(e.type){case 1:return[0,1,2,3,4,5,6,7];case 0:return[a.N,a.E,a.S,a.W];case 2:return[a.NE,a.NW,a.SE,a.SW];case 3:return 0===e.color?[a.E]:[a.W];case 4:return 0===e.color?[0,2,4,5,6,7]:[0,1,2,3,4,6]}}pieceToString(){return"将王相子侯"[this.type]}}(h=a||(a={}))[h.N=0]="N",h[h.NW=1]="NW",h[h.W=2]="W",h[h.SW=3]="SW",h[h.S=4]="S",h[h.SE=5]="SE",h[h.E=6]="E",h[h.NE=7]="NE";const M=66666,g=M*Math.PI;function w(e,t,s){if(e.status===o.YellowWin)return e.colorToMove===r.Yellow?M-t:-M+t;if(e.status===o.BlueWin)return e.colorToMove===r.Blue?M-t:-M+t;if(e.status===o.Draw)return 0;let l=0;for(const o of e.board){if(null===o)continue;const t=e.colorToMove===(null==o?void 0:o.color)?1:-1;switch(null==o?void 0:o.type){case i.Wang:l+=2e4*t;break;case i.Zi:l+=100*t;break;case i.Jiang:case i.Xiang:l+=250*t;break;case i.Hou:l+=300*t}}for(const o of e.pool){const t=e.colorToMove===(null==o?void 0:o.color)?1:-1;switch(null==o?void 0:o.type){case i.Zi:l+=40*t;break;case i.Jiang:case i.Xiang:l+=80*t}}return s&&(l+=10*Array.from(e.legalMoves((e=>e===i.Wang))).length,l+=25*Array.from(e.legalMoves((e=>e===i.Jiang||e===i.Xiang||e===i.Hou))).length,e.nullMove(),l-=10*Array.from(e.legalMoves((e=>e===i.Wang))).length,l-=25*Array.from(e.legalMoves((e=>e===i.Jiang||e===i.Xiang||e===i.Hou))).length,e.undoMove()),l}const m={lower:-M,upper:M};class k{constructor(){this.scoreTable=new Map,this.moveTable=new Map,this.nodes=0,this.depth=0,this.seldepth=0,this.startTime=(new Date).getTime(),this.durationMS=600}bound(e,t,o,s,i,l){this.nodes++,this.seldepth=Math.max(s,this.seldepth);let r=this.scoreTable.get({hash:e.hash,depth:Math.max(o,0),isRoot:i});if(void 0===r&&(r=m),r.lower>=t&&(!i||this.moveTable.has(e.hash)))return r.lower;if(r.upper<t)return r.upper;if((new Date).getTime()-this.startTime>this.durationMS)return g;let n=-M;if(o<=0){let t=w(e,s,l);n=Math.max(n,t)}if(n<=t){let i=this.moveTable.get(e.hash);if(void 0!==i)if(e.makeMove(i),o>0||w(e,s)>=95){let i=-this.bound(e,1-t,o-1,s+1,!1,l);if(e.undoMove(),i===g)return g;n=Math.max(n,i)}else e.undoMove()}if(n<t){let i=Array.from(e.legalMoves()).map((t=>{e.makeMove(t);let o=w(e,s);return e.undoMove(),{score:-o,move:t}})).sort(((e,t)=>e.score-t.score));for(const r of i){if(!(o>0||-r.score>=95&&w(e,s)-r.score>n))break;{e.makeMove(r.move);let i=-this.bound(e,1-t,o-1,s+1,!1,l);if(e.undoMove(),i===g)return g;if(n=Math.max(n,i),n>=t){this.moveTable.size>=2e6&&this.moveTable.clear(),this.moveTable.set(e.hash,r.move);break}}}}return this.scoreTable.size>=2e6&&this.scoreTable.clear(),n>=t?this.scoreTable.set({hash:e.hash,depth:o,isRoot:i},{lower:n,upper:r.upper}):n<t&&this.scoreTable.set({hash:e.hash,depth:o,isRoot:i},{lower:r.lower,upper:n}),n}search(e,t,o,s){this.durationMS=t,this.nodes=0,this.depth=0,this.seldepth=0,this.startTime=(new Date).getTime();let i=null;for(this.depth=1;this.depth<=(void 0===o?100:o);this.depth++){let t=-M,o=M;for(;t<o-8;){let i=Math.floor((t+o+1)/2),l=this.bound(e,i,this.depth,0,!0,s);if(l===g){t=g;break}l>=i?t=l:o=l}if(t===g)break;let l=this.bound(e,t,this.depth,0,!0,s);if(l===g)break;if(console.log(`DEPTH ${this.depth} SCORE ${l} NODES ${this.nodes} TIME ${(new Date).getTime()-this.startTime}`),i=this.moveTable.get(e.hash),(new Date).getTime()-this.startTime>this.durationMS||l>66656)break}return i}}let b=new p,y=null;const T='<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">',H='<svg viewBox="-2.5 -2.5 50 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">';function S(e){switch(e.type){case i.Xiang:return"INT"===O?e.color===r.Blue?H+'<g id="black-bishop" class="black bishop" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#000" stroke-linecap="butt"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/></g>':H+'<g id="white-bishop" class="white bishop" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g>':T+'<text x="4" y="24.5" style="font-size: 23px; font-weight: 500; font-family: \'Ma Shan Zheng\', cursive;">相</text></svg>';case i.Jiang:return"INT"===O?e.color===r.Blue?H+'<g id="black-rook" class="black rook" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" stroke-linecap="butt"/><path d="M14 29.5v-13h17v13H14z" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" stroke-linecap="butt"/><path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="miter"/></g>':H+'<g id="white-rook" class="white rook" fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g>':T+'<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: \'Ma Shan Zheng\', cursive;">王</text></svg>';case i.Wang:return"INT"===O?e.color===r.Blue?H+'<g id="black-king" class="black king" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/><path d="M20 8h5" stroke-linejoin="miter"/><path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g>':H+'<g id="white-king" class="white king" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g>':T+'<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: \'Ma Shan Zheng\', cursive;">将</text></svg>';case i.Zi:return"INT"===O?e.color===r.Blue?H+'<g id="black-pawn" class="black pawn"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></g>':H+'<g id="white-pawn" class="white pawn"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></g>':T+'<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: \'Ma Shan Zheng\', cursive;">子</text></svg>';case i.Hou:return"INT"===O?e.color===r.Blue?H+'<g id="black-queen" class="black queen" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/></g>':H+'<g id="white-queen" class="white queen" fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g>':T+'<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: \'Ma Shan Zheng\', cursive;">侯</text></svg>'}}function x(e,t){switch(t.color){case r.Yellow:e.style.backgroundColor="#ffe641";break;case r.Blue:e.style.backgroundColor="#3952f5"}switch(t.type){case i.Xiang:e.innerHTML=`<div>${T}<path d="M0 0H8L0 8M24 0H32V8M32 24V32H24M0 32H8L0 24">\n</path></svg>${S(t)}</div>`;break;case i.Jiang:e.innerHTML=`<div>${T}<path d="M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0">\n</path></svg>${S(t)}</div>`;break;case i.Wang:e.innerHTML=`<div>${T}<path d="M0 0H8L0 8M24 0H32V8M32 24V32H24M0 32H8L0 24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0">\n</path></svg>${S(t)}</div>`;break;case i.Zi:e.innerHTML=`<div>${T}<path d="${(null==t?void 0:t.color)===r.Yellow?"M32 22 38 16 32 10":"M0 22-6 16 0 10"}">\n</path></svg>${S(t)}</div>`;break;case i.Hou:e.innerHTML=`<div>${T}<path d="${(null==t?void 0:t.color)===r.Yellow?"M24 0H32V8M32 24V32H24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0":"M0 0H8L0 8M0 32H8L0 24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0"}">\n</path></svg>${S(t)}</div>`}}function W(){for(let o=0;o<12;o++){let e=b.board[o],t=document.querySelector(`#square${o}`);null!==e?x(t,e):(t.innerHTML="",t.style.backgroundColor="#fcfffc")}const e=document.querySelector("#pool");let t=[];e.innerHTML="",b.pool.forEach(((e,o)=>{if(void 0===e)return;let s=document.createElement("div");s.id="poolsq"+o,s.classList.add("square"),x(s,e),t.push(s)})),t.forEach((t=>e.appendChild(t)))}function z(){for(let e=0;e<12;e++)document.querySelector(`#square${e}`).classList.remove("legal-move")}function L(e){z();for(const t of b.legalMoves())t.from===e&&document.querySelector(`#square${t.to}`).classList.add("legal-move")}let C=!0,I=new k,q=new k,O="CHN";async function V(e,t,o){return(b.colorToMove===r.Yellow?I:q).search(b,e,t,o)}window.startGame=function(){b=new p,N()};const Y=document.querySelector("#yellow-select"),B=document.querySelector("#blue-select"),j=document.querySelector("#status-value");function N(){return z(),W(),C=!1,b.status===o.YellowWin?(alert("Yellow wins!"),j.innerHTML="Yellow wins",void(C=!0)):b.status===o.BlueWin?(alert("Blue wins!"),j.innerHTML="Blue wins",void(C=!0)):b.status===o.Draw?(alert("Draw (by 20 non-capture moves)!"),j.innerHTML="Draw (by 20 non-capture moves)",void(C=!0)):void function(){switch(j.innerHTML=b.colorToMove===r.Yellow?"Yellow to Move":"Blue to Move",(b.colorToMove===r.Yellow?Y:B).value){case"s1":C=!0,setTimeout((()=>{V(100).then((e=>{b.makeMove(e),N()}))}),300);break;case"s2":C=!0,setTimeout((()=>{V(600).then((e=>{b.makeMove(e),N()}))}),300);break;case"s3":C=!0,setTimeout((()=>{V(5e3,10).then((e=>{b.makeMove(e),N()}))}),300);break;case"h1":C=!0,setTimeout((()=>{V(500,void 0,!0).then((e=>{b.makeMove(e),N()}))}),300);break;case"h":C=!1}}()}!function(){const e=document.querySelector("#piece-type"),t=localStorage.getItem("pieceType");null!==t&&(O=t,e.value=t),document.onclick=e=>{if(!C){const t=e.target.id;if(t.startsWith("square")){const e=parseInt(t.split("square")[1]);for(const t of b.legalMoves())if(t.from===y&&t.to===e)return b.makeMove(t),void N();y===e?(z(),y=null):(L(e),y=e)}else if(t.startsWith("poolsq")){const e=parseInt(t.split("poolsq")[1]);y===12+e?(z(),y=null):(L(12+e),y=12+e)}else z(),y=null}};for(let o=0;o<12;o++)document.querySelector("#board").innerHTML+=`<div class='square' id='square${o}'"></div>`;W(),e.onchange=()=>{O=e.value,localStorage.setItem("pieceType",O),W()}}();
