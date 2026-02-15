import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
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
          {t("Privacy Policy", "Política de Privacidade")}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t("Last Updated: February 2026", "Última Atualização: Fevereiro 2026")}
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:text-base [&_h3]:font-medium [&_h3]:mt-4 [&_h3]:mb-2 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

          <h2>1. {t("Introduction", "Introdução")}</h2>
          <p>
            {t(
              'Destiny Hacking ("the App") is a personal development and self-improvement application operated by Merx Digital Solutions Ltd, a company registered in England and Wales ("we", "us", "our", "the Company").',
              'Destiny Hacking ("o App") é um aplicativo de desenvolvimento pessoal e autoaperfeiçoamento operado pela Merx Digital Solutions Ltd, uma empresa registrada na Inglaterra e País de Gales ("nós", "nosso", "a Empresa").'
            )}
          </p>
          <p>
            {t(
              "We are committed to protecting your privacy and handling your personal data transparently and securely. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use the Destiny Hacking mobile application and any related services.",
              "Estamos comprometidos em proteger sua privacidade e tratar seus dados pessoais de forma transparente e segura. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você usa o aplicativo móvel Destiny Hacking e quaisquer serviços relacionados."
            )}
          </p>
          <p>
            <strong>{t("Data Controller:", "Controlador de Dados:")}</strong> Merx Digital Solutions Ltd<br />
            <strong>{t("Contact Email:", "E-mail de Contato:")}</strong> privacy@destinyhacking.app
          </p>

          <h2>2. {t("What Data We Collect", "Quais Dados Coletamos")}</h2>

          <h3>2.1 {t("Account Information", "Informações da Conta")}</h3>
          <ul>
            <li>{t("Email address (used for account creation and login)", "Endereço de e-mail (usado para criação de conta e login)")}</li>
            <li>{t("Password (stored securely using industry-standard hashing; we never store plaintext passwords)", "Senha (armazenada com segurança usando hash padrão da indústria; nunca armazenamos senhas em texto simples)")}</li>
            <li>{t("Display name or username (optional)", "Nome de exibição ou nome de usuário (opcional)")}</li>
            <li>{t("Language preference (English or Portuguese)", "Preferência de idioma (Inglês ou Português)")}</li>
          </ul>

          <h3>2.2 {t("App Usage Data", "Dados de Uso do App")}</h3>
          <ul>
            <li>{t("Daily Cycle completion records (morning, midday, evening calibrations)", "Registros de conclusão do Ciclo Diário (calibrações matutinas, vespertinas e noturnas)")}</li>
            <li>{t("Slider/axis values you set during calibration (your 15 axis scores)", "Valores de slider/eixo que você define durante a calibração (suas 15 pontuações de eixo)")}</li>
            <li>{t("Destiny Score (calculated average of your axis values)", "Pontuação de Destino (média calculada dos seus valores de eixo)")}</li>
            <li>{t("Streak data (consecutive days of practice)", "Dados de sequência (dias consecutivos de prática)")}</li>
            <li>{t("Module and chapter progress", "Progresso de módulos e capítulos")}</li>
            <li>{t("Audiobook listening progress", "Progresso de escuta do audiolivro")}</li>
            <li>{t("Achievement and badge data", "Dados de conquistas e emblemas")}</li>
            <li>{t("Intended actions and observed effects (text entries you provide voluntarily)", "Ações pretendidas e efeitos observados (entradas de texto que você fornece voluntariamente)")}</li>
            <li>{t("Reflection journal entries", "Entradas do diário de reflexão")}</li>
          </ul>

          <h3>2.3 {t("Technical Data", "Dados Técnicos")}</h3>
          <ul>
            <li>{t("Device type and operating system version", "Tipo de dispositivo e versão do sistema operacional")}</li>
            <li>{t("App version", "Versão do App")}</li>
            <li>{t("Anonymous crash reports and error logs", "Relatórios de falhas anônimos e logs de erros")}</li>
            <li>{t("IP address (collected automatically by our servers; not stored long-term)", "Endereço IP (coletado automaticamente por nossos servidores; não armazenado a longo prazo)")}</li>
          </ul>

          <h3>2.4 {t("Data We Do NOT Collect", "Dados que NÃO Coletamos")}</h3>
          <ul>
            <li>{t("We do not collect precise GPS location data", "Não coletamos dados precisos de localização GPS")}</li>
            <li>{t("We do not collect contacts, photos, or files from your device", "Não coletamos contatos, fotos ou arquivos do seu dispositivo")}</li>
            <li>{t("We do not collect health data from Apple HealthKit or Google Fit", "Não coletamos dados de saúde do Apple HealthKit ou Google Fit")}</li>
            <li>{t("We do not collect financial or payment card data", "Não coletamos dados financeiros ou de cartão de pagamento")}</li>
            <li>{t("We do not collect biometric data", "Não coletamos dados biométricos")}</li>
          </ul>

          <h2>3. {t("How We Use Your Data", "Como Usamos Seus Dados")}</h2>

          <h3>3.1 {t("To Provide the Service (Contractual Necessity)", "Para Fornecer o Serviço (Necessidade Contratual)")}</h3>
          <ul>
            <li>{t("Create and manage your account", "Criar e gerenciar sua conta")}</li>
            <li>{t("Store your calibration data, progress, and streaks", "Armazenar seus dados de calibração, progresso e sequências")}</li>
            <li>{t("Calculate your Destiny Score and generate personalised insights", "Calcular sua Pontuação de Destino e gerar insights personalizados")}</li>
            <li>{t("Deliver AI-powered coaching suggestions based on your lowest-scoring axes", "Fornecer sugestões de coaching com IA baseadas nos seus eixos com menor pontuação")}</li>
            <li>{t("Sync your data across your devices", "Sincronizar seus dados entre seus dispositivos")}</li>
          </ul>

          <h3>3.2 {t("To Improve the App (Legitimate Interest)", "Para Melhorar o App (Interesse Legítimo)")}</h3>
          <ul>
            <li>{t("Analyse anonymised, aggregated usage patterns to improve features", "Analisar padrões de uso anonimizados e agregados para melhorar recursos")}</li>
            <li>{t("Diagnose technical issues and fix bugs", "Diagnosticar problemas técnicos e corrigir bugs")}</li>
            <li>{t("Understand which features are most used to guide development priorities", "Entender quais recursos são mais usados para orientar prioridades de desenvolvimento")}</li>
          </ul>

          <h3>3.3 {t("To Communicate With You", "Para Comunicar-se Com Você")}</h3>
          <ul>
            <li>{t("Send you optional push notifications (morning, midday, evening reminders) — only if you opt in", "Enviar notificações push opcionais (lembretes matutinos, vespertinos e noturnos) — apenas se você optar por receber")}</li>
            <li>{t("Send essential account-related emails (password reset, security alerts)", "Enviar e-mails essenciais relacionados à conta (redefinição de senha, alertas de segurança)")}</li>
            <li>{t("Respond to your support requests", "Responder às suas solicitações de suporte")}</li>
          </ul>

          <h2>4. {t("AI Features and Third-Party AI Services", "Recursos de IA e Serviços de IA de Terceiros")}</h2>
          <p>{t('Destiny Hacking includes an AI coaching feature (the "Stoic Strategist") that analyses your axis scores to provide personalised guidance.', 'Destiny Hacking inclui um recurso de coaching com IA (o "Estrategista Estoico") que analisa suas pontuações de eixo para fornecer orientação personalizada.')}</p>
          <p><strong>{t("Important:", "Importante:")}</strong> {t("When you use the AI coaching feature, your axis scores and relevant context may be sent to a third-party AI provider (such as OpenAI or Anthropic) to generate personalised responses. No personally identifiable information such as your name or email is included in these requests — only your anonymised axis values.", "Quando você usa o recurso de coaching com IA, suas pontuações de eixo e contexto relevante podem ser enviados a um provedor de IA terceiro (como OpenAI ou Anthropic) para gerar respostas personalizadas. Nenhuma informação pessoalmente identificável, como seu nome ou e-mail, é incluída nessas solicitações — apenas seus valores de eixo anonimizados.")}</p>

          <h2>5. {t("Lawful Basis for Processing", "Base Legal para Processamento")}</h2>
          <p>{t("Under the UK GDPR, we rely on the following lawful bases:", "Sob o GDPR do Reino Unido, nos baseamos nas seguintes bases legais:")}</p>
          <ul>
            <li><strong>{t("Contractual Necessity", "Necessidade Contratual")}</strong> — {t("Processing necessary to provide the app service you signed up for.", "Processamento necessário para fornecer o serviço do app para o qual você se inscreveu.")}</li>
            <li><strong>{t("Consent", "Consentimento")}</strong> — {t("For optional features such as push notifications, AI coaching, and marketing communications. You can withdraw consent at any time.", "Para recursos opcionais como notificações push, coaching com IA e comunicações de marketing. Você pode retirar o consentimento a qualquer momento.")}</li>
            <li><strong>{t("Legitimate Interest", "Interesse Legítimo")}</strong> — {t("For anonymised analytics and app improvement.", "Para análises anonimizadas e melhoria do app.")}</li>
          </ul>

          <h2>6. {t("Data Sharing and Third Parties", "Compartilhamento de Dados e Terceiros")}</h2>
          <p><strong>{t("We do not sell, rent, or trade your personal data to any third party.", "Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros.")}</strong></p>
          <p>{t("We may share limited data with service providers bound by data processing agreements: cloud hosting provider, AI service provider (anonymised axis data only), email service provider, and error monitoring service.", "Podemos compartilhar dados limitados com provedores de serviços vinculados por acordos de processamento de dados: provedor de hospedagem em nuvem, provedor de serviço de IA (apenas dados de eixo anonimizados), provedor de serviço de e-mail e serviço de monitoramento de erros.")}</p>

          <h2>7. {t("International Data Transfers", "Transferências Internacionais de Dados")}</h2>
          <p>{t("Your data may be transferred to and processed in countries outside the United Kingdom or European Economic Area. Where such transfers occur, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by the UK Information Commissioner's Office.", "Seus dados podem ser transferidos e processados em países fora do Reino Unido ou do Espaço Econômico Europeu. Quando tais transferências ocorrem, garantimos que salvaguardas apropriadas estejam em vigor, incluindo Cláusulas Contratuais Padrão (SCCs) aprovadas pelo Escritório do Comissário de Informação do Reino Unido.")}</p>

          <h2>8. {t("Data Retention", "Retenção de Dados")}</h2>
          <ul>
            <li><strong>{t("Account data:", "Dados da conta:")}</strong> {t("Retained while your account is active. Deleted within 30 days of account deletion.", "Retidos enquanto sua conta estiver ativa. Excluídos dentro de 30 dias da exclusão da conta.")}</li>
            <li><strong>{t("Calibration and progress data:", "Dados de calibração e progresso:")}</strong> {t("Retained while your account is active.", "Retidos enquanto sua conta estiver ativa.")}</li>
            <li><strong>{t("AI coaching conversation logs:", "Logs de conversa de coaching com IA:")}</strong> {t("Not stored. Generated in real-time and discarded after delivery.", "Não armazenados. Gerados em tempo real e descartados após a entrega.")}</li>
            <li><strong>{t("Technical logs:", "Logs técnicos:")}</strong> {t("Retained for a maximum of 90 days.", "Retidos por no máximo 90 dias.")}</li>
            <li><strong>{t("Backup data:", "Dados de backup:")}</strong> {t("Purged within 60 days of account deletion.", "Eliminados dentro de 60 dias da exclusão da conta.")}</li>
          </ul>

          <h2>9. {t("Your Rights", "Seus Direitos")}</h2>
          <p>{t("Under the UK GDPR, you have the following rights regarding your personal data:", "Sob o GDPR do Reino Unido, você tem os seguintes direitos em relação aos seus dados pessoais:")}</p>
          <ul>
            <li><strong>{t("Right of Access:", "Direito de Acesso:")}</strong> {t("Request a copy of all personal data we hold about you.", "Solicitar uma cópia de todos os dados pessoais que mantemos sobre você.")}</li>
            <li><strong>{t("Right to Rectification:", "Direito de Retificação:")}</strong> {t("Request correction of inaccurate personal data.", "Solicitar correção de dados pessoais imprecisos.")}</li>
            <li><strong>{t('Right to Erasure ("Right to Be Forgotten"):', 'Direito ao Apagamento ("Direito de Ser Esquecido"):')}</strong> {t("Request deletion of your personal data.", "Solicitar exclusão dos seus dados pessoais.")}</li>
            <li><strong>{t("Right to Data Portability:", "Direito à Portabilidade de Dados:")}</strong> {t("Request your data in a structured, machine-readable format.", "Solicitar seus dados em um formato estruturado e legível por máquina.")}</li>
            <li><strong>{t("Right to Restrict Processing:", "Direito de Restringir o Processamento:")}</strong> {t("Request that we limit how we use your data.", "Solicitar que limitemos como usamos seus dados.")}</li>
            <li><strong>{t("Right to Object:", "Direito de Objeção:")}</strong> {t("Object to processing based on legitimate interests.", "Objetar ao processamento baseado em interesses legítimos.")}</li>
            <li><strong>{t("Right to Withdraw Consent:", "Direito de Retirar o Consentimento:")}</strong> {t("Withdraw consent at any time for consent-based processing.", "Retirar o consentimento a qualquer momento para processamento baseado em consentimento.")}</li>
            <li><strong>{t("Right to Lodge a Complaint:", "Direito de Apresentar uma Reclamação:")}</strong> {t("Complain to the UK Information Commissioner's Office (ICO) at ico.org.uk.", "Reclamar ao Escritório do Comissário de Informação do Reino Unido (ICO) em ico.org.uk.")}</li>
          </ul>
          <p>{t("To exercise any of these rights, contact us at privacy@destinyhacking.app. We will respond within 30 days.", "Para exercer qualquer um desses direitos, entre em contato conosco em privacy@destinyhacking.app. Responderemos dentro de 30 dias.")}</p>

          <h2>10. {t("Account Deletion", "Exclusão de Conta")}</h2>
          <p>{t("You can delete your account at any time directly within the app by navigating to Settings > Delete Account. This action is permanent and will:", "Você pode excluir sua conta a qualquer momento diretamente no app navegando até Configurações > Excluir Conta. Esta ação é permanente e irá:")}</p>
          <ul>
            <li>{t("Delete your account credentials", "Excluir suas credenciais de conta")}</li>
            <li>{t("Delete all your calibration data, progress, streaks, and achievements", "Excluir todos os seus dados de calibração, progresso, sequências e conquistas")}</li>
            <li>{t("Delete all journal entries and reflection data", "Excluir todas as entradas de diário e dados de reflexão")}</li>
            <li>{t("Remove your data from our active systems within 30 days", "Remover seus dados dos nossos sistemas ativos dentro de 30 dias")}</li>
            <li>{t("Remove your data from backup systems within 60 days", "Remover seus dados dos sistemas de backup dentro de 60 dias")}</li>
          </ul>

          <h2>11. {t("Data Security", "Segurança de Dados")}</h2>
          <p>{t("We implement appropriate technical and organisational measures to protect your personal data, including:", "Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais, incluindo:")}</p>
          <ul>
            <li>{t("Encryption in transit (TLS/HTTPS for all data transmission)", "Criptografia em trânsito (TLS/HTTPS para toda transmissão de dados)")}</li>
            <li>{t("Encryption at rest for stored personal data", "Criptografia em repouso para dados pessoais armazenados")}</li>
            <li>{t("Secure password hashing (bcrypt or equivalent)", "Hash seguro de senhas (bcrypt ou equivalente)")}</li>
            <li>{t("Access controls limiting data access to authorised personnel only", "Controles de acesso limitando o acesso a dados apenas a pessoal autorizado")}</li>
            <li>{t("Regular security reviews and updates", "Revisões e atualizações regulares de segurança")}</li>
          </ul>

          <h2>12. {t("Children's Privacy", "Privacidade de Crianças")}</h2>
          <p>{t("Destiny Hacking is not directed at children under the age of 16. We do not knowingly collect personal data from anyone under 16 years of age. If we discover that we have inadvertently collected data from a child under 16, we will delete it promptly.", "Destiny Hacking não é direcionado a crianças menores de 16 anos. Não coletamos intencionalmente dados pessoais de menores de 16 anos. Se descobrirmos que coletamos inadvertidamente dados de uma criança menor de 16 anos, os excluiremos prontamente.")}</p>

          <h2>13. {t("Cookies and Local Storage", "Cookies e Armazenamento Local")}</h2>
          <p>{t("The Destiny Hacking app uses local device storage (such as localStorage and IndexedDB) to store your preferences, session tokens, and offline data. This data remains on your device and is not transmitted to third parties. We do not use tracking cookies, advertising cookies, or third-party analytics cookies within the app.", "O app Destiny Hacking usa armazenamento local do dispositivo (como localStorage e IndexedDB) para armazenar suas preferências, tokens de sessão e dados offline. Estes dados permanecem no seu dispositivo e não são transmitidos a terceiros. Não usamos cookies de rastreamento, cookies de publicidade ou cookies de análise de terceiros dentro do app.")}</p>

          <h2>14. {t("Push Notifications", "Notificações Push")}</h2>
          <p>{t("The app may request permission to send push notifications for daily calibration reminders. This is entirely optional. You can enable or disable notifications at any time through your device settings or within the app.", "O app pode solicitar permissão para enviar notificações push para lembretes diários de calibração. Isso é totalmente opcional. Você pode ativar ou desativar notificações a qualquer momento através das configurações do seu dispositivo ou dentro do app.")}</p>

          <h2>15. {t("Changes to This Privacy Policy", "Alterações nesta Política de Privacidade")}</h2>
          <p>{t("We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by displaying a notice within the app and updating the \"Last Updated\" date at the top of this policy.", "Podemos atualizar esta Política de Privacidade de tempos em tempos para refletir mudanças em nossas práticas, tecnologia ou requisitos legais. Notificaremos você sobre alterações materiais exibindo um aviso dentro do app e atualizando a data de \"Última Atualização\" no topo desta política.")}</p>

          <h2>16. {t("Contact Us", "Fale Conosco")}</h2>
          <p>
            {t("If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:", "Se você tiver alguma dúvida, preocupação ou solicitação sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco:")}
          </p>
          <p>
            <strong>Merx Digital Solutions Ltd</strong><br />
            Email: privacy@destinyhacking.app
          </p>
          <p>
            {t("You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):", "Você também tem o direito de apresentar uma reclamação ao Escritório do Comissário de Informação do Reino Unido (ICO):")}
          </p>
          <p>
            Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">https://ico.org.uk</a><br />
            {t("Telephone:", "Telefone:")} 0303 123 1113
          </p>
        </div>
      </div>
    </div>
  );
}
