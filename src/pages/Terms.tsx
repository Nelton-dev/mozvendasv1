import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Termos e Condições</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl p-4 prose prose-sm dark:prose-invert">
        <h2>Termos e Condições de Uso — MOZ VENDAS</h2>
        <p><strong>Última atualização:</strong> 30 de Março de 2026</p>

        <h3>1. Aceitação dos Termos</h3>
        <p>
          Ao utilizar a plataforma MOZ VENDAS, o utilizador concorda com os presentes Termos e Condições. 
          Se não concordar com algum dos termos, deverá cessar imediatamente o uso da plataforma.
        </p>

        <h3>2. Descrição do Serviço</h3>
        <p>
          O MOZ VENDAS é uma plataforma de comércio social que permite aos utilizadores publicar, 
          comprar e vender produtos em Moçambique. A plataforma serve como intermediária, 
          conectando compradores e vendedores.
        </p>

        <h3>3. Registo e Conta</h3>
        <ul>
          <li>O utilizador deve fornecer informações verdadeiras e atualizadas ao criar uma conta.</li>
          <li>É responsável por manter a confidencialidade da sua conta e senha.</li>
          <li>Deve ter pelo menos 18 anos de idade para utilizar a plataforma.</li>
        </ul>

        <h3>4. Responsabilidades do Vendedor</h3>
        <ul>
          <li>Os vendedores são responsáveis pela veracidade das informações dos seus produtos.</li>
          <li>Devem garantir que os produtos anunciados estão em conformidade com a legislação moçambicana.</li>
          <li>É proibido anunciar produtos ilegais, contrafeitos ou que violem direitos de terceiros.</li>
          <li>Os preços devem ser apresentados em Meticais (MZN) e incluir todas as taxas aplicáveis.</li>
        </ul>

        <h3>5. Responsabilidades do Comprador</h3>
        <ul>
          <li>Os compradores devem verificar as informações do produto antes de efectuar uma compra.</li>
          <li>As transacções são realizadas directamente entre comprador e vendedor.</li>
          <li>O MOZ VENDAS não se responsabiliza por disputas entre compradores e vendedores.</li>
        </ul>

        <h3>6. Conteúdo Proibido</h3>
        <p>É expressamente proibido publicar:</p>
        <ul>
          <li>Produtos ilegais ou contrabandeados</li>
          <li>Conteúdo ofensivo, discriminatório ou que incite à violência</li>
          <li>Informações falsas ou enganosas</li>
          <li>Produtos que violem direitos de propriedade intelectual</li>
          <li>Armas, drogas ou substâncias controladas</li>
        </ul>

        <h3>7. Privacidade e Dados</h3>
        <p>
          A recolha e tratamento de dados pessoais é feita em conformidade com a legislação aplicável. 
          Os dados de contacto (como número de WhatsApp) são partilhados apenas quando o utilizador 
          interage com um anúncio.
        </p>

        <h3>8. Propriedade Intelectual</h3>
        <p>
          Todo o conteúdo da plataforma MOZ VENDAS, incluindo logotipos, design e código, 
          é propriedade exclusiva do MOZ VENDAS e está protegido por leis de propriedade intelectual.
        </p>

        <h3>9. Limitação de Responsabilidade</h3>
        <p>
          O MOZ VENDAS não garante a qualidade, segurança ou legalidade dos produtos anunciados. 
          A plataforma não é parte nas transacções entre utilizadores e não assume responsabilidade 
          por perdas ou danos resultantes dessas transacções.
        </p>

        <h3>10. Suspensão e Encerramento</h3>
        <p>
          O MOZ VENDAS reserva-se o direito de suspender ou encerrar contas que violem estes termos, 
          sem aviso prévio.
        </p>

        <h3>11. Modificações</h3>
        <p>
          Estes termos podem ser alterados a qualquer momento. As alterações entram em vigor 
          imediatamente após a publicação na plataforma.
        </p>

        <h3>12. Legislação Aplicável</h3>
        <p>
          Estes Termos e Condições são regidos pela legislação da República de Moçambique.
        </p>

        <h3>13. Contacto</h3>
        <p>
          Para questões relacionadas com estes termos, entre em contacto connosco através da plataforma.
        </p>
      </div>
    </div>
  );
};

export default Terms;
