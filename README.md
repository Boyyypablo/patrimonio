# Gestão de Patrimônio Mútua

Aplicação Next.js para consultar, cadastrar e movimentar bens patrimoniais da Mútua.

Os dados desta versão ficam na sessão do navegador. O acesso da tela de login também é local: qualquer e-mail válido e uma senha preenchida entram no sistema.

## Scripts

```bash
npm install
npm run dev
npm test
npm run build
```

## Rotas

- `/` módulos
- `/login` acesso
- `/patrimonios` lista, ficha, novo bem e plaqueta
- `/movimentacao` transferência em lote e transferência de um bem
- `/contabilizacao` cálculo e contabilização da competência
- `/cadastros` listas auxiliares
- `/ler-qr` leitura de QR Code da plaqueta
