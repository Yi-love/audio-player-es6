'use strict';

import path from 'path';
import koa from 'koa';
import logger from 'koa-logger';
import serve from 'koa-static';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import convert from 'koa-convert';
import 'babel-polyfill';
import render from './lib/render';

const app = koa();
const router = new Router();
app.use(bodyParser());
app.use(logger());
app.use(router.routes());

router.get('/' , index);
function *index(){
	this.body = yield render('index' , {title:'音乐播放器'});
}
app.on('error' , (err , ctx)=>{
	console.log('server error : ' , err , ctx);
});

app.use(serve(path.join(__dirname ,'../dist')));

if ( module.parent ) {
	app.listen(3000);
	console.log('listening on port 3000 ...');
}
