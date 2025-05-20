// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import config from './config.mjs';
import routes from './controllers/routes.mjs';

const Server = class Server {
  constructor() {
    const env = process.argv[2] || 'development';
    this.config = config[env];

    if (!this.config) {
      console.error(`[ERROR] Environnement "${env}" non défini dans config.mjs`);
      process.exit(1);
    }

    console.log(`[INFO] Environnement utilisé : ${env}`);
    this.app = express();
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;
      if (!host) {
        throw new Error('URL MongoDB manquante dans la configuration');
      }

      await mongoose.connect(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      this.connect = mongoose.connection;
      console.log('[✅] MongoDB connecté');

      const close = () => {
        this.connect.close((error) => {
          if (error) {
            console.error('[ERROR] dbConnect() close() ->', error);
          } else {
            console.log('[CLOSE] dbConnect() -> connexion MongoDB fermée');
          }
        });
      };

      this.connect.on('error', (err) => {
        console.error('[ERROR] dbConnect() ->', err);
        setTimeout(() => this.dbConnect(), 5000);
      });

      this.connect.on('disconnected', () => {
        console.log('[DISCONNECTED] dbConnect() -> reconnexion dans 5s');
        setTimeout(() => this.dbConnect(), 5000);
      });

      process.on('SIGINT', () => {
        close();
        console.log('[API] Fin du process - connexion MongoDB fermée');
        process.exit(0);
      });

    } catch (err) {
      console.error('[❌ Erreur MongoDB] :', err.message);
    }
  }

  middleware() {
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());
  }

  routes() {
    new routes.Users(this.app, this.connect);
    this.app.use(routes.albumRoutes);
    this.app.use(routes.photoRoutes);
    this.app.use((req, res) => {
      res.status(404).json({ code: 404, message: 'Not Found' });
    });
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();
      this.app.listen(this.config.port, () =>
        console.log(`[🚀] Serveur démarré sur le port ${this.config.port}`)
      );
    } catch (err) {
      console.error('[ERROR] Server ->', err.message);
    }
  }
};

export default Server;
