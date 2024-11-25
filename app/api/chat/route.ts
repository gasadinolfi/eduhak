import { groq } from '@ai-sdk/groq';
import { streamObject } from "ai";
import { quizQuestionsSchema } from "./schema";

export const maxDuration = 300; // Increased maximum execution time

export async function POST(req: Request) {
  try {
    const { questionNumber }: { questionNumber: number } = await req.json();

    if (typeof questionNumber !== 'number' || questionNumber <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid questionNumber' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contexto = `
      CONCEPTOS BÁSICOS UAS, RPAS, drone o aeromodelo
      Se usan diferentes términos para referirnos a las aeronaves no tripuladas, pero ¿qué diferencias hay entre ellos?
      
      • Aeronave no tripulada o RPA (Remotely Piloted Aircraft): Cualquier aeronave que opere o esté diseñada para operar de forma autónoma o para ser pilotada a distancia sin un piloto a bordo. Este RPA, también llamado DAOD por DINACIA (Dispositivo Aéreo Operado a Distancia).
      
      • Dron (drone en inglés): Palabra coloquialmente usada para referirse en general a todas las aeronaves no tripuladas, debido a su similitud con un zumbido de abejorro. Es otra forma de nombrar a los RPA.
      
      • Aeromodelo: Aeronave de tamaño reducido pilotada a distancia, utilizada principalmente para vuelos deportivos o experimentales. También puede ser un RPA.
      
      • RPAS («Sistema de Aeronave Pilotada por Control Remoto»): Aeronave pilotada a distancia, su sistema de vuelo, su estación, los enlaces requeridos de mando y control, y cualquier otro componente según lo indicado en el diseño de la aeronave.
      
      • UAV («Aeronave No Tripulada»): Aeronave no tripulada que tiene la capacidad de volar de manera autónoma y el equipo para controlarla de forma remota.
      
      • UAS («Unmanned Aircraft System»): El término UAS engloba los RPAS y las aeronaves autónomas. Es un término más genérico que se refiere a cualquier sistema de aeronaves no tripuladas, incluidos RPAS y UAV (el piloto a distancia no puede intervenir durante el vuelo).
      
      • VFR (Visual Flight Rules), IFR (Instrument Flight Rules), VMC (Visual Meteorological Conditions), IMC (Instrument Meteorological Conditions).
      
      • Piloto a distancia: Persona física responsable de la conducción segura del vuelo de un UAS mediante la utilización de sus mandos de vuelo, ya sea manualmente o, cuando la aeronave vuele de forma automática, mediante la supervisión de su vuelo (rumbo, velocidad, altura, entorno...), siendo capaz de intervenir y cambiar los parámetros de vuelo (rumbo, velocidad y/o altura) en cualquier momento.
      
      • Operador de UAS: Cualquier persona, física o jurídica, que sea propietaria de un UAS o lo alquile. Una persona puede ser operador y piloto si esa misma persona es quien vuela el UAS. Sin embargo, se puede ser piloto a distancia sin necesidad de ser operador, por ejemplo, si el piloto trabaja para una compañía que ofrece servicios con UAS. En aquellos casos en los que un piloto a distancia utiliza un UAS para volar en su tiempo libre, esa persona también es un operador de UAS.
      
      • DINACIA (Dirección Nacional de Aviación Civil e Infraestructura Aeronáutica): DINACIA es el organismo estatal que vela por el cumplimiento de las normas de aviación civil en Uruguay. Promueve el desarrollo y aplicación de la legislación aeronáutica para aportar seguridad, calidad y sostenibilidad al sistema de aviación civil nacional. En caso de incumplimiento de las normas de aviación civil en territorio nacional, DINACIA es quien tiene la potestad sancionadora.
    `;

    console.log('Generating questions...');
    const result = await streamObject({
      model: groq("llama-3.1-70b-versatile"),
      system:
        "Eres un generador de preguntas especializado en la creación de preguntas de opción múltiple de alta dificultad basadas en el contenido proporcionado. Genera preguntas que abarquen diferentes aspectos como definiciones, componentes, procedimientos, y regulaciones descritas en el texto. Cada pregunta debe ser única, tanto en su enfoque como en las opciones de respuesta. Asegúrate de que no haya repetición de preguntas ni de opciones entre ellas.",
      prompt: `Genera ${questionNumber} preguntas sobre el siguiente contexto: ${contexto}`,
      schema: quizQuestionsSchema,
    });

    const questions = await result.object;
    console.log('Questions generated:', JSON.stringify(questions, null, 2));

    if (!questions || !questions.questions || !Array.isArray(questions.questions) || questions.questions.length !== questionNumber) {
      console.error('Invalid questions generated:', questions);
      throw new Error('Invalid questions generated');
    }

    return new Response(JSON.stringify(questions), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

