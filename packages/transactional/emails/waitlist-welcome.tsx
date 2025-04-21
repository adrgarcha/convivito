import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface WaitlistWelcomeProps {
    email: string;
}

const main = {
    backgroundColor: '#fff7ed',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
    maxWidth: '100%',
};

const heading = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '48px',
    marginBottom: '20px',
    color: '#1a202c',
};

const text = {
    margin: '0 0 20px 0',
    fontSize: '16px',
    lineHeight: '26px',
    color: '#2d3748',
};

const highlight = {
    backgroundColor: '#b9f8cf',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#1a202c',
};

export default function WaitlistWelcome({ email = "hello@example.com" }: WaitlistWelcomeProps) {
    const previewText = `¡Gracias por unirte a la lista de espera!`;

    return (
        <Html lang='es'>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary: '#b9f8cf',
                                secondary: '#fff7ed',
                                textDark: '#1a202c',
                                textLight: '#2d3748',
                            },
                        },
                    },
                }}
            >
                <Body style={main} className="bg-secondary">
                    <Container style={container}>
                        <Section>
                            <Heading style={heading} className="text-textDark">
                                ¡Bienvenido/a a la lista de espera!
                            </Heading>
                            <Text style={text} className="text-textLight">
                                Hola <span style={highlight} className="bg-primary text-textDark font-medium">{email}</span>,
                            </Text>
                            <Text style={text} className="text-textLight">
                                Gracias por registrarte en la lista de espera para nuestro nuevo acompañante de piso 👏. Estamos trabajando arduamente para lanzarlo lo antes posible.
                            </Text>
                            <Text style={text} className="text-textLight">
                                Serás uno/a de los primeros en saber cuándo esté listo. Mientras tanto, te mantendremos informado/a sobre nuestro progreso 📣.
                            </Text>
                            <Text style={text} className="text-textLight">
                                ¡Estamos muy emocionados de tenerte a bordo! Tu interés significa mucho para nosotros ❤️. Si tienes alguna pregunta, no dudes en contactarnos.
                            </Text>
                            <Text style={text} className="text-textLight">
                                Saludos,<br />
                                El equipo de Convivito
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}