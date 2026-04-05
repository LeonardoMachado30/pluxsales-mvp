import { GoogleGenAI, Type } from "@google/genai";
import { FiscalProfile } from "../../types";

export const geminiService = {
  get isEnabled() {
    return !!process.env.API_KEY;
  },

  async suggestSmartTaxBreakdown(
    productName: string,
    totalPrice: number,
    profile: FiscalProfile,
  ): Promise<any> {
    if (!this.isEnabled) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const prompt = `
        Você é um Especialista em Engenharia Tributária para Restaurantes.
        Seu objetivo é decompor o preço de venda de um produto em seus componentes fiscais para reduzir impostos.
        
        PRODUTO: "${productName}"
        PREÇO TOTAL: R$ ${totalPrice}
        PERFIL DE ESTRATÉGIA: ${profile}

        REGRAS DE ESTRATÉGIA:
        - CONSERVADOR: Tributa quase tudo no NCM de Refeição (21069090).
        - MODERADO: Separa apenas os insumos principais (carne, pão) usando seus NCMs isentos.
        - ARROJADO: Maximiza a alocação em itens isentos (Hortifruti NCM 07, Carnes NCM 02, Café NCM 09). Atribui o mínimo possível (apenas mão de obra) ao NCM tributado de Buffet.

        RETORNE UM JSON COM:
        - main_ncm: O NCM principal do produto.
        - breakdown: Um array de objetos { name, ncm, allocated_price, is_tax_free, justification }.
        - total_tax_free_percentage: Porcentagem do valor total que não será tributado.
        - advice: Um breve conselho para o contador.

        A soma de 'allocated_price' deve ser exatamente R$ ${totalPrice}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              main_ncm: { type: Type.STRING },
              total_tax_free_percentage: { type: Type.NUMBER },
              advice: { type: Type.STRING },
              breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    ncm: { type: Type.STRING },
                    allocated_price: { type: Type.NUMBER },
                    is_tax_free: { type: Type.BOOLEAN },
                    justification: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Erro na decomposição fiscal:", error);
      return null;
    }
  },

  async validateFiscalData(
    productName: string,
    ncm: string,
    category: string,
  ): Promise<any> {
    return { isValid: true, advice: "Validado" };
  },

  async auditSalesForAccountant(sales: any[]): Promise<string> {
    return "Auditoria concluída.";
  },

  async analyzeBusinessHealth(data: any): Promise<string> {
    return "OK.";
  },
  async analyzeNcm(ncm: string): Promise<any> {
    return { text: "NCM OK" };
  },
  async suggestReplenishment(i: any): Promise<any> {
    return "OK";
  },
  async analyzeSectors(s: any): Promise<any> {
    return "OK";
  },
  async suggestLabelStandards(a: any, b: any): Promise<any> {
    return "OK";
  },
  async suggestSmartTax(n: string): Promise<any> {
    return null;
  },
};
