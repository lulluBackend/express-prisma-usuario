import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.ts";
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });
export { prisma };

import express from "express";
import cors from "cors";
import db from "./database.js";

db.execute("SELECT 1")
    .then(() => console.log("Banco conectado com sucesso!"))
    .catch(err => console.error("Erro ao conectar no banco:", err));

const app = express();
app.use(cors());
app.use(express.json());

/*
=================================
CREATE
=================================
*/
app.post("/api/usuarios", async (req, res) => {
    try {
        const { nome, email, senha, perfil_nome } = req.body;

        const usuario = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha,
                perfil: {
                    create: {
                        perfil_nome
                    }
                }
            },
            include: {
                perfil: true
            }
        });

        return res.status(201).json({
            mensagem: "Usuário cadastrado com sucesso",
            user: usuario
        });

    } catch (error) {

        // erro de email duplicado (Prisma unique)
        if (error.code === "P2002") {
            return res.status(400).json({
                erro: "Email já cadastrado"
            });
        }

        return res.status(500).json({ erro: error.message });
    }
});

/*
=================================
READ - LISTAR
=================================
*/
app.get("/api/usuarios", async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: {
                perfil: true
            }
        });

        return res.json({
            mensagem: "Usuários encontrados com sucesso",
            users: usuarios
        });

    } catch (error) {
        return res.status(500).json({ erro: error.message });
    }
});

/*
=================================
UPDATE
=================================
*/
app.put("/api/usuarios/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;

        const usuario = await prisma.usuario.update({
            where: { id: Number(id) },
            data: { nome, email, senha },
            include: { perfil: true }
        });

        return res.json({
            mensagem: "Usuário atualizado com sucesso",
            user: usuario
        });

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        if (error.code === "P2002") {
            return res.status(400).json({
                erro: "Email já cadastrado"
            });
        }

        return res.status(500).json({ erro: error.message });
    }
});

/*
=================================
DELETE
=================================
*/
app.delete("/api/usuarios/:id", async (req, res) => {
    try {
        await prisma.usuario.delete({
            where: { id: Number(id) }
        });

        return res.json({
            mensagem: "Usuário removido com sucesso"
        });

    } catch (error) {

        if (error.code === "P2025") {
            return res.status(404).json({
                mensagem: "Usuário não encontrado"
            });
        }

        return res.status(500).json({ erro: error.message });
    }
});

app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});