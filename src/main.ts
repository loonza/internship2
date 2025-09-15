import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import * as hbs from 'express-handlebars';
import * as express from 'express';
import session from 'express-session';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {GroupModule} from "./group/group.module";
import {AuthModule} from "./auth/auth.module";
import {UserModule} from "./user/user.module";
import {ServiceModule} from "./service/service.module";
import {ResourceModule} from "./resource/resource.module";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);


    app.engine('hbs', hbs.engine({
        extname: 'hbs',
        defaultLayout: 'layout',
        helpers: {
            eq: (a, b) => a === b,
            gt: (a, b) => a > b,
            lt: (a, b) => a < b,
            add: (a, b) => a + b,
            subtract: (a, b) => a - b,
            encodeURIComponent: (str) => encodeURIComponent(str),
            json: (context) => JSON.stringify(context),
        }
    }));

    app.setViewEngine('hbs');
    app.setBaseViewsDir(join(__dirname, 'views'));

    app.useStaticAssets(join(__dirname, '..', 'public'));

    app.use(express.urlencoded({extended: true}));

    app.use(
        session({
            secret: 'loonza',
            resave: false,
            saveUninitialized: false,
            cookie: {secure: false},
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Groups API')
        .setDescription('API для управления группами пользователей')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        include: [
            GroupModule,
            AuthModule,
            UserModule,
            ServiceModule,
            ResourceModule
        ],
    });
    SwaggerModule.setup('api', app, document);


    const port = process.env.PORT || 3000;
    await app.listen(port);
}

bootstrap();