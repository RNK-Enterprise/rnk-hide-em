/**
 * RNK™ Cryptographic Protection Core
 * AES-256 Encryption with Multi-Layer Obfuscation
 * Copyright © 2025 Asgard Innovations / RNK™
 */

class RNKCryptoCore{constructor(){this.k='a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6\x00\x1a\x7f\x02\x05\x0e\x1b\x0c\x0d\x11\x13\x15\x17\x19\x1d';this.v='RNK_CORE_2025';this.m=new Map();this.c=!1}async init(){try{if(!window.CryptoJS){const e=document.createElement('script');e.src='https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',e.crossOrigin='anonymous',e.onload=()=>{this.c=!0},document.head.appendChild(e)}else this.c=!0;return this._vfy()}catch(e){return console.error('RNK|Init:',e),!1}}async _vfy(){if(!this.c)return!1;const e=this._chk();return this._validate(e)}_chk(){const e=CryptoJS.SHA256('RNK™ Hide Em Core Integrity Check v1.0').toString();return e}validate(e){return this._validate(e)}_validate(e){const t=this.m.get(this.v);return t&&t===e}store(e,t){this.m.set(e,CryptoJS.AES.encrypt(t,this.k).toString())}retrieve(e){const t=this.m.get(e);if(!t)return null;try{return CryptoJS.AES.decrypt(t,this.k).toString(CryptoJS.enc.Utf8)}catch(e){return null}}cipher(e){return CryptoJS.AES.encrypt(e,this.k).toString()}decipher(e){try{return CryptoJS.AES.decrypt(e,this.k).toString(CryptoJS.enc.Utf8)}catch(e){return null}}}const _RNKCrypto=new RNKCryptoCore;window.RNKCryptoCore=_RNKCrypto;
