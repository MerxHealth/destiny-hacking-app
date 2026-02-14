import { db } from '../server/db';
import { bookChapters } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const ptTitles: Record<number, { titlePt: string; descriptionPt: string }> = {
  1: {
    titlePt: "O Dom Divino: O Poder Incrível e a Responsabilidade Aterrorizante do Livre Arbítrio",
    descriptionPt: "Descubra o poder extraordinário do livre arbítrio e a responsabilidade que vem com ele."
  },
  2: {
    titlePt: "A Lei Inquebrantável da Sua Realidade",
    descriptionPt: "Compreenda as leis universais que moldam a sua realidade e como o livre arbítrio interage com elas."
  },
  3: {
    titlePt: "A Vantagem Injusta: Como Encontrar Significado num Mundo de Injustiça",
    descriptionPt: "Aprenda a encontrar propósito e significado mesmo quando a vida parece injusta."
  },
  4: {
    titlePt: "A Gravidade da Escolha: Navegando os Papéis de Agressor e Vítima",
    descriptionPt: "Explore a dinâmica complexa entre agressor e vítima e o poder da escolha consciente."
  },
  5: {
    titlePt: "A Encruzilhada da Escolha: O Custo Terrível da Indecisão",
    descriptionPt: "Descubra porque a indecisão é a pior decisão e como fazer escolhas corajosas."
  },
  6: {
    titlePt: "O Momento Fénix: Renascendo das Cinzas do Seu Passado",
    descriptionPt: "Aprenda a transformar o seu passado em combustível para um futuro extraordinário."
  },
  7: {
    titlePt: "Marco Aurélio e o Caminho Estoico para a Liberdade Interior",
    descriptionPt: "Descubra a sabedoria estoica de Marco Aurélio e como aplicá-la à sua vida moderna."
  },
  8: {
    titlePt: "O Peso da Sua Vontade: O Poder Radical de Assumir Responsabilidade",
    descriptionPt: "Compreenda como assumir total responsabilidade pela sua vida é o caminho para a verdadeira liberdade."
  },
  9: {
    titlePt: "A Alquimia da Vontade: Transformando Sofrimento em Força",
    descriptionPt: "Aprenda a arte de transformar adversidade e sofrimento em força e sabedoria."
  },
  10: {
    titlePt: "O Surfista e a Onda: A Dança do Livre Arbítrio e das Leis Universais",
    descriptionPt: "Descubra como harmonizar o seu livre arbítrio com as forças universais que o rodeiam."
  },
  11: {
    titlePt: "O Paradoxo da Oração: Pedir Ajuda Enfraquece o Livre Arbítrio?",
    descriptionPt: "Explore a relação entre fé, oração e livre arbítrio — e como coexistem."
  },
  12: {
    titlePt: "O Mito do Génio Solitário: Porque a Sua Vontade Precisa de uma Tribo",
    descriptionPt: "Descubra porque ninguém alcança a grandeza sozinho e como construir a sua tribo."
  },
  13: {
    titlePt: "O Arquitecto do Destino: Como as Suas Escolhas Diárias Constroem a Sua Vida",
    descriptionPt: "Aprenda como cada pequena escolha diária é um tijolo na construção do seu destino."
  },
  14: {
    titlePt: "O Seu Momento Invictus: O Capitão da Sua Alma",
    descriptionPt: "O capítulo final — assuma o controlo total como capitão da sua alma e mestre do seu destino."
  },
};

async function main() {
  for (const [chapterNum, data] of Object.entries(ptTitles)) {
    const num = parseInt(chapterNum);
    const result = await db.update(bookChapters)
      .set({ titlePt: data.titlePt, descriptionPt: data.descriptionPt })
      .where(eq(bookChapters.chapterNumber, num));
    console.log(`✅ Ch${num}: ${data.titlePt}`);
  }
  
  console.log('\nAll 14 Portuguese titles updated!');
  process.exit(0);
}

main();
