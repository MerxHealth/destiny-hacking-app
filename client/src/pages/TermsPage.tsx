import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("Back", "Voltar")}
        </Link>

        <h1 className="text-2xl font-bold mb-2">
          {t("Terms & Conditions", "Termos e Condições")}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("Last Updated: February 2026", "Última Atualização: Fevereiro 2026")}
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

          <h2>1. {t("Agreement to Terms", "Aceitação dos Termos")}</h2>
          <p>
            {t(
              'These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", "your") and Merx Digital Solutions Ltd, a company registered in England and Wales ("Company", "we", "us", "our"), regarding your access to and use of the Destiny Hacking mobile application ("the App") and any related services.',
              'Estes Termos e Condições ("Termos") constituem um acordo juridicamente vinculativo entre você ("Usuário", "você", "seu") e a Merx Digital Solutions Ltd, uma empresa registrada na Inglaterra e País de Gales ("Empresa", "nós", "nosso"), em relação ao seu acesso e uso do aplicativo móvel Destiny Hacking ("o App") e quaisquer serviços relacionados.'
            )}
          </p>
          <p>
            {t(
              "By creating an account, downloading, installing, or using the App, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use the App.",
              "Ao criar uma conta, baixar, instalar ou usar o App, você reconhece que leu, entendeu e concorda em estar vinculado a estes Termos e à nossa Política de Privacidade. Se você não concordar com estes Termos, não deve usar o App."
            )}
          </p>

          <h2>2. {t("Eligibility", "Elegibilidade")}</h2>
          <p>
            {t(
              "You must be at least 16 years of age to create an account and use the App. By using the App, you represent and warrant that you meet this age requirement. If you are under 18, you confirm that you have obtained consent from a parent or legal guardian.",
              "Você deve ter pelo menos 16 anos de idade para criar uma conta e usar o App. Ao usar o App, você declara e garante que atende a este requisito de idade. Se você tiver menos de 18 anos, confirma que obteve o consentimento de um pai ou responsável legal."
            )}
          </p>

          <h2>3. {t("Account Registration and Security", "Registro de Conta e Segurança")}</h2>
          <p>
            {t(
              "To access the full features of the App, you must create an account by providing a valid email address and a secure password. You are responsible for:",
              "Para acessar todos os recursos do App, você deve criar uma conta fornecendo um endereço de e-mail válido e uma senha segura. Você é responsável por:"
            )}
          </p>
          <ul>
            <li>{t("Maintaining the confidentiality of your login credentials", "Manter a confidencialidade de suas credenciais de login")}</li>
            <li>{t("All activities that occur under your account", "Todas as atividades que ocorrem em sua conta")}</li>
            <li>{t("Notifying us immediately of any unauthorised use of your account", "Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta")}</li>
          </ul>
          <p>
            {t(
              "We reserve the right to suspend or terminate accounts that we reasonably believe have been compromised or are being used in violation of these Terms.",
              "Reservamo-nos o direito de suspender ou encerrar contas que acreditamos razoavelmente terem sido comprometidas ou estarem sendo usadas em violação destes Termos."
            )}
          </p>

          <h2>4. {t("Description of Service", "Descrição do Serviço")}</h2>
          <p>
            {t(
              "Destiny Hacking is a personal development application designed to help users develop self-awareness and exercise free will through daily calibration practices. The App provides:",
              "Destiny Hacking é um aplicativo de desenvolvimento pessoal projetado para ajudar os usuários a desenvolver autoconsciência e exercer o livre arbítrio através de práticas diárias de calibração. O App oferece:"
            )}
          </p>
          <ul>
            <li>{t("A 15-axis self-assessment calibration system", "Um sistema de calibração de autoavaliação de 15 eixos")}</li>
            <li>{t('Daily cycle practice (morning, midday, evening calibrations)', 'Prática de ciclo diário (calibrações matutinas, vespertinas e noturnas)')}</li>
            <li>{t('AI-powered coaching insights (the "Stoic Strategist")', 'Insights de coaching com IA (o "Estrategista Estoico")')}</li>
            <li>{t("Interactive learning modules based on the Destiny Hacking book", "Módulos de aprendizagem interativos baseados no livro Destiny Hacking")}</li>
            <li>{t("Audiobook content", "Conteúdo de audiolivro")}</li>
            <li>{t("Progress tracking, streaks, and achievements", "Acompanhamento de progresso, sequências e conquistas")}</li>
            <li>{t("A philosophical framework (the Prologue/Philosophy section)", "Uma estrutura filosófica (a seção Prólogo/Filosofia)")}</li>
          </ul>
          <p>
            <strong>{t("Important Disclaimer:", "Aviso Importante:")}</strong>{" "}
            {t(
              "The App is a self-improvement tool and is NOT a substitute for professional medical, psychological, psychiatric, or therapeutic advice, diagnosis, or treatment. If you are experiencing mental health difficulties, please consult a qualified healthcare professional.",
              "O App é uma ferramenta de autoaperfeiçoamento e NÃO substitui aconselhamento médico, psicológico, psiquiátrico ou terapêutico profissional, diagnóstico ou tratamento. Se você estiver enfrentando dificuldades de saúde mental, consulte um profissional de saúde qualificado."
            )}
          </p>

          <h2>5. {t("AI Features Disclosure", "Divulgação de Recursos de IA")}</h2>
          <p>{t("The App includes an AI coaching feature that generates personalised insights based on your axis calibration data. By using this feature:", "O App inclui um recurso de coaching com IA que gera insights personalizados com base nos seus dados de calibração de eixos. Ao usar este recurso:")}</p>
          <ul>
            <li>{t("You understand that AI-generated content is for informational and motivational purposes only and does not constitute professional advice.", "Você entende que o conteúdo gerado por IA é apenas para fins informativos e motivacionais e não constitui aconselhamento profissional.")}</li>
            <li>{t("You consent to your anonymised axis data being processed by third-party AI providers (such as OpenAI or Anthropic) solely to generate your coaching responses.", "Você consente que seus dados de eixo anonimizados sejam processados por provedores de IA terceiros (como OpenAI ou Anthropic) exclusivamente para gerar suas respostas de coaching.")}</li>
            <li>{t("You acknowledge that AI responses may occasionally be inaccurate, incomplete, or inappropriate. We do not guarantee the accuracy of AI-generated content.", "Você reconhece que as respostas de IA podem ocasionalmente ser imprecisas, incompletas ou inadequadas. Não garantimos a precisão do conteúdo gerado por IA.")}</li>
            <li>{t("You may opt out of AI features at any time without losing access to the core App functionality.", "Você pode optar por não usar os recursos de IA a qualquer momento sem perder o acesso à funcionalidade principal do App.")}</li>
          </ul>

          <h2>6. {t("Subscriptions and Payments", "Assinaturas e Pagamentos")}</h2>
          <p>{t("The App may offer free and premium subscription tiers. If you purchase a subscription:", "O App pode oferecer níveis de assinatura gratuitos e premium. Se você adquirir uma assinatura:")}</p>
          <ul>
            <li>{t("Payments are processed exclusively through Apple's App Store or Google Play Store billing systems. We do not collect or store your payment card details.", "Os pagamentos são processados exclusivamente através dos sistemas de cobrança da App Store da Apple ou Google Play Store. Não coletamos nem armazenamos os dados do seu cartão de pagamento.")}</li>
            <li>{t("Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing period.", "As assinaturas são renovadas automaticamente, a menos que sejam canceladas pelo menos 24 horas antes do final do período de cobrança atual.")}</li>
            <li>{t("You can manage and cancel your subscription through your Apple App Store or Google Play Store account settings.", "Você pode gerenciar e cancelar sua assinatura através das configurações da sua conta na App Store da Apple ou Google Play Store.")}</li>
            <li>{t("Refunds are handled in accordance with the policies of the respective app store through which you made your purchase.", "Reembolsos são tratados de acordo com as políticas da respectiva loja de aplicativos através da qual você fez sua compra.")}</li>
            <li>{t("Prices may change with reasonable notice. Existing subscribers will be notified before any price increase takes effect on their next renewal.", "Os preços podem mudar com aviso razoável. Os assinantes existentes serão notificados antes que qualquer aumento de preço entre em vigor na próxima renovação.")}</li>
          </ul>

          <h2>7. {t("Cancellation and Account Deletion", "Cancelamento e Exclusão de Conta")}</h2>
          <h3>7.1 {t("Cancelling Your Subscription", "Cancelando Sua Assinatura")}</h3>
          <p>{t("You can cancel your subscription at any time through your Apple App Store or Google Play Store account settings. Cancellation will take effect at the end of your current billing period. You will retain access to premium features until that date.", "Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta na App Store da Apple ou Google Play Store. O cancelamento entrará em vigor no final do seu período de cobrança atual. Você manterá o acesso aos recursos premium até essa data.")}</p>
          <h3>7.2 {t("Deleting Your Account", "Excluindo Sua Conta")}</h3>
          <p>{t("You can permanently delete your account at any time by navigating to Settings > Delete Account within the App. Account deletion will:", "Você pode excluir permanentemente sua conta a qualquer momento navegando até Configurações > Excluir Conta dentro do App. A exclusão da conta irá:")}</p>
          <ul>
            <li>{t("Permanently remove all your personal data, calibration history, progress, and achievements", "Remover permanentemente todos os seus dados pessoais, histórico de calibração, progresso e conquistas")}</li>
            <li>{t("Cancel any active subscription (you may also need to cancel via your app store to stop future billing)", "Cancelar qualquer assinatura ativa (você também pode precisar cancelar pela loja de aplicativos para interromper cobranças futuras)")}</li>
            <li>{t("Be completed within 30 days from active systems and 60 days from backup systems", "Ser concluída dentro de 30 dias dos sistemas ativos e 60 dias dos sistemas de backup")}</li>
          </ul>
          <p>{t("Account deletion is irreversible. We strongly recommend exporting your data before deleting your account.", "A exclusão da conta é irreversível. Recomendamos fortemente exportar seus dados antes de excluir sua conta.")}</p>

          <h2>8. {t("User Conduct", "Conduta do Usuário")}</h2>
          <p>{t("You agree not to:", "Você concorda em não:")}</p>
          <ul>
            <li>{t("Use the App for any illegal or unauthorised purpose", "Usar o App para qualquer finalidade ilegal ou não autorizada")}</li>
            <li>{t("Attempt to reverse-engineer, decompile, or disassemble the App", "Tentar engenharia reversa, descompilar ou desmontar o App")}</li>
            <li>{t("Attempt to gain unauthorised access to our systems, servers, or other users' accounts", "Tentar obter acesso não autorizado aos nossos sistemas, servidores ou contas de outros usuários")}</li>
            <li>{t("Use automated systems (bots, scrapers) to access the App", "Usar sistemas automatizados (bots, scrapers) para acessar o App")}</li>
            <li>{t("Transmit viruses, malware, or any harmful code", "Transmitir vírus, malware ou qualquer código prejudicial")}</li>
            <li>{t("Interfere with or disrupt the integrity or performance of the App", "Interferir ou interromper a integridade ou desempenho do App")}</li>
            <li>{t("Impersonate any person or entity", "Se passar por qualquer pessoa ou entidade")}</li>
            <li>{t("Share your account credentials with others", "Compartilhar suas credenciais de conta com outros")}</li>
          </ul>

          <h2>9. {t("Intellectual Property", "Propriedade Intelectual")}</h2>
          <p>{t("All content within the App, including but not limited to the Destiny Hacking book text, the 15 Axes Framework, the Prologue, audiobook recordings, module content, user interface design, graphics, icons, and software code, is the exclusive property of Merx Digital Solutions Ltd or its licensors and is protected by copyright, trademark, and other intellectual property laws.", "Todo o conteúdo dentro do App, incluindo, mas não se limitando ao texto do livro Destiny Hacking, o Framework dos 15 Eixos, o Prólogo, gravações de audiolivro, conteúdo de módulos, design de interface do usuário, gráficos, ícones e código de software, é propriedade exclusiva da Merx Digital Solutions Ltd ou seus licenciadores e é protegido por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.")}</p>

          <h2>10. {t("User Content", "Conteúdo do Usuário")}</h2>
          <p>{t("Any content you create within the App (such as journal entries, intended actions, and reflections) remains your intellectual property. However, by using the App, you grant us a limited licence to store and process this content solely for the purpose of providing the service to you.", "Qualquer conteúdo que você criar dentro do App (como entradas de diário, ações pretendidas e reflexões) permanece como sua propriedade intelectual. No entanto, ao usar o App, você nos concede uma licença limitada para armazenar e processar este conteúdo exclusivamente para fins de prestação do serviço a você.")}</p>

          <h2>11. {t("Disclaimers", "Isenções de Responsabilidade")}</h2>
          <p>{t('THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.', 'O APP É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL" SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO SE LIMITANDO A GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM PROPÓSITO ESPECÍFICO E NÃO VIOLAÇÃO.')}</p>

          <h2>12. {t("Limitation of Liability", "Limitação de Responsabilidade")}</h2>
          <p>{t("To the maximum extent permitted by applicable law, Merx Digital Solutions Ltd and its directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the App.", "Na máxima extensão permitida pela lei aplicável, a Merx Digital Solutions Ltd e seus diretores, funcionários e agentes não serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes de ou relacionados ao seu uso do App.")}</p>

          <h2>13. {t("Indemnification", "Indenização")}</h2>
          <p>{t("You agree to indemnify, defend, and hold harmless Merx Digital Solutions Ltd and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses arising from your use of the App, violation of these Terms, or infringement of any third-party rights.", "Você concorda em indenizar, defender e isentar a Merx Digital Solutions Ltd e suas afiliadas, diretores, funcionários e agentes de quaisquer reivindicações, danos, perdas, responsabilidades, custos e despesas decorrentes do seu uso do App, violação destes Termos ou violação de quaisquer direitos de terceiros.")}</p>

          <h2>14. {t("Third-Party Services and Links", "Serviços e Links de Terceiros")}</h2>
          <p>{t("The App may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the content, privacy practices, or availability of third-party services.", "O App pode conter links para sites ou serviços de terceiros que não são de nossa propriedade ou controlados por nós. Não somos responsáveis pelo conteúdo, práticas de privacidade ou disponibilidade de serviços de terceiros.")}</p>

          <h2>15. {t("Modifications to Terms", "Modificações nos Termos")}</h2>
          <p>{t("We reserve the right to modify these Terms at any time. We will provide notice of material changes by displaying a notice within the App and updating the \"Last Updated\" date at the top of these Terms. Your continued use of the App after changes are posted constitutes acceptance of the modified Terms.", "Reservamo-nos o direito de modificar estes Termos a qualquer momento. Forneceremos aviso de alterações materiais exibindo um aviso dentro do App e atualizando a data de \"Última Atualização\" no topo destes Termos. Seu uso continuado do App após a publicação das alterações constitui aceitação dos Termos modificados.")}</p>

          <h2>16. {t("Termination", "Rescisão")}</h2>
          <p>{t("We may terminate or suspend your access to the App immediately, without prior notice, if you breach any provision of these Terms, we are required to do so by law, or we decide to discontinue the App or any part of it.", "Podemos rescindir ou suspender seu acesso ao App imediatamente, sem aviso prévio, se você violar qualquer disposição destes Termos, se formos obrigados a fazê-lo por lei, ou se decidirmos descontinuar o App ou qualquer parte dele.")}</p>

          <h2>17. {t("Governing Law and Dispute Resolution", "Lei Aplicável e Resolução de Disputas")}</h2>
          <p>{t("These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.", "Estes Termos são regidos e interpretados de acordo com as leis da Inglaterra e País de Gales. Quaisquer disputas decorrentes de ou em conexão com estes Termos estarão sujeitas à jurisdição exclusiva dos tribunais da Inglaterra e País de Gales.")}</p>

          <h2>18. {t("Severability", "Divisibilidade")}</h2>
          <p>{t("If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.", "Se qualquer disposição destes Termos for considerada inexequível ou inválida, essa disposição será limitada ou eliminada na extensão mínima necessária, e as disposições restantes permanecerão em pleno vigor e efeito.")}</p>

          <h2>19. {t("Entire Agreement", "Acordo Integral")}</h2>
          <p>{t("These Terms, together with our Privacy Policy, constitute the entire agreement between you and Merx Digital Solutions Ltd regarding your use of the App and supersede any prior agreements or communications.", "Estes Termos, juntamente com nossa Política de Privacidade, constituem o acordo integral entre você e a Merx Digital Solutions Ltd em relação ao seu uso do App e substituem quaisquer acordos ou comunicações anteriores.")}</p>

          <h2>20. {t("Contact Information", "Informações de Contato")}</h2>
          <p>
            {t("If you have any questions about these Terms, please contact us:", "Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco:")}
          </p>
          <p>
            <strong>Merx Digital Solutions Ltd</strong><br />
            Email: support@destinyhacking.app
          </p>
        </div>
      </div>
    </div>
  );
}
