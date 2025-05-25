import prisma from "../config/db.js";

// GET /api/art?since=2025-05-08&page=1&pageSize=10
export const fetchArtPieces = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sinceISO = req.query.sinceISO;
    const page = parseInt(req.query.page ?? "1", 10);
    const pageSize = parseInt(req.query.pageSize ?? "10", 10);
    const where = { userId };
    if (sinceISO) where.createdAt = { gte: new Date(sinceISO) };

    const artPieces = await prisma.arts.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        gifUrl: true,
        thumbnailUrl: true,
        title: true,
        createdAt: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.json(artPieces);
  } catch (err) {
    next(err);
  }
};

// body: { gifUrl, thumbnailUrl, title }
export const addArtPiece = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gifUrl, thumbnailUrl, title = "Untitled" } = req.body;

    if (!gifUrl || !thumbnailUrl)
      return res
        .status(400)
        .json({ error: "gifUrl and thumbnailUrl are required." });

    const artPiece = await prisma.arts.create({
      data: { userId, gifUrl, thumbnailUrl, title },
      select: {
        id: true,
        gifUrl: true,
        thumbnailUrl: true,
        title: true,
        createdAt: true,
      },
    });

    res.status(201).json(artPiece);
  } catch (err) {
    next(err);
  }
};

export const deleteArtPiece = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);

    //verify ownership
    const existing = await prisma.arts.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      return res.status(404).json({ error: "Art piece not found." });

    await prisma.arts.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
