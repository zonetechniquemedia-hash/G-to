// Fichier: commands/quiz.js

const quizFoot = [
  { q: "⚽ FOOT: Quel club a remporté le plus de Ligues des Champions ?", a: "real madrid" },
  { q: "⚽ FOOT: Quel joueur possède 8 Ballons d'Or ?", a: "messi" },
  { q: "⚽ FOOT: Dans quel club joue Kylian Mbappé ?", a: "real madrid" },
  { q: "⚽ FOOT: Quel est le nom du stade du Real Madrid ?", a: "santiago bernabeu" },
  { q: "⚽ FOOT: Quelle nation a remporté la Coupe du Monde 2022 ?", a: "argentine" },
  { q: "⚽ FOOT: Quel joueur célèbre est surnommé CR7 ?", a: "ronaldo" }
];

const quizAnime = [
  { q: "⛩️ ANIME: Quel est le nom du démon à 9 queues dans Naruto ?", a: "kurama" },
  { q: "⛩️ ANIME: Dans Jujutsu Kaisen, quel est le prénom de Gojo ?", a: "satoru" },
  { q: "⛩️ ANIME: Qui est le personnage principal dans Boruto: Two Blue Vortex ?", a: "boruto" },
  { q: "⛩️ ANIME: Quel est le nom du clan aux yeux Sharingan dans Naruto ?", a: "uchiha" },
  { q: "⛩️ ANIME: Dans Classroom of the Elite, quel est le nom de famille de Kiyotaka ?", a: "ayanokoji" }
];

global.activeQuiz = global.activeQuiz || {};

export async function quiz(client, message, args) {
  const remoteJid = message.key.remoteJid;
  const choice = args[0] ? args[0].trim().toLowerCase() : '';

  // Pour stopper le quiz manuellement
  if (choice === 'stop') {
    if (global.activeQuiz[remoteJid]) {
      delete global.activeQuiz[remoteJid];
      await client.sendMessage(remoteJid, { text: "🛑 *Quiz annulé.*" });
    } else {
      await client.sendMessage(remoteJid, { text: "⚠️ Aucun quiz n'est en cours dans ce groupe." });
    }
    return;
  }

  // 1. Verrouillage : Si un quiz est DÉJÀ en cours
  if (global.activeQuiz[remoteJid]) {
    await client.sendMessage(remoteJid, { 
      text: "⚠️ *Un quiz est déjà en cours dans ce groupe !*\n\nRépondez d'abord à la question en cours avant d'en lancer un autre." 
    });
    return;
  }

  // 2. Si l'utilisateur tape juste ".quiz" sans numéro -> On lui demande de choisir
  if (choice !== '1' && choice !== '2') {
    const menuText = `🎯 *GHETTO BOT — CHOIX DU QUIZ* 🎯\n\n` +
                     `Veuillez choisir une catégorie :\n\n` +
                     `⚽ Tape : *.quiz 1*  -> Quiz Football\n` +
                     `⛩️ Tape : *.quiz 2*  -> Quiz Anime / Manga`;
    await client.sendMessage(remoteJid, { text: menuText });
    return;
  }

  // 3. Sélection de la liste selon le choix (1 = Foot, 2 = Anime)
  const pool = choice === '1' ? quizFoot : quizAnime;
  const item = pool[Math.floor(Math.random() * pool.length)];

  global.activeQuiz[remoteJid] = { answer: item.a.toLowerCase() };

  const text = `🎯 *GETO BOT — QUIZ* 🎯\n\n` +
               `❓ *Question :* ${item.q}\n\n` +
               `👉 *Écris ta réponse directement dans le chat !*`;

  await client.sendMessage(remoteJid, { text: text });
}

export async function checkQuizAnswer(client, message) {
  const remoteJid = message.key.remoteJid;
  const userText = message.message?.conversation || message.message?.extendedTextMessage?.text;

  if (!userText || !global.activeQuiz[remoteJid]) return;

  const quizData = global.activeQuiz[remoteJid];
  const cleanInput = userText.trim().toLowerCase();

  if (cleanInput.includes(quizData.answer)) {
    const sender = message.key.participant || remoteJid;
    const userMention = `@${sender.split('@')[0]}`;

    await client.sendMessage(remoteJid, {
      text: `🎉 *BRAVO ${userMention} !* Bonne réponse : *${quizData.answer.toUpperCase()}* !\n\nLe quiz est terminé. Tu peux en relancer un avec *.quiz 1* ou *.quiz 2* !`,
      mentions: [sender]
    });

    delete global.activeQuiz[remoteJid];
  }
}
