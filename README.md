# toolsCSD

Uma caixa de ferramentas web com utilitários do dia a dia para developers, tudo numa única página com tabs — sem build, sem dependências de servidor, 100% client-side.

🔗 [Ver ao vivo](https://diogomcasado.github.io/toolsCSD/)

## Ferramentas

- **Gerador de Passwords** — comprimento configurável, tipos de carateres, exclusão de carateres semelhantes/ambíguos, medidor de força, geração em lote
- **Base64** — codificar/descodificar com suporte UTF-8
- **Hash** — MD5, SHA-1, SHA-256, SHA-384, SHA-512 em tempo real
- **JSON Formatter** — formatar ou minificar, com validação de erros
- **URL Encoder/Decoder** — `encodeURIComponent`/`decodeURIComponent`
- **UUID** — geração v4, com opções de maiúsculas/sem hífens e lote
- **Conversor de Cores** — HEX ↔ RGB ↔ HSL sincronizados, com preview e color picker
- **Cron Parser/Creator** — parser e construtor de expressões cron, com descrição em português e cálculo das próximas execuções
- **QR Code** — gerador com nível de correção de erro, tamanho e cores configuráveis, e download em PNG
- **Limpeza de Metadados** — remove EXIF, GPS, XMP, IPTC e comentários de imagens (JPEG, PNG e WebP sem recompressão; HEIC e outros formatos são reconvertidos), mostrando o que foi encontrado antes de apagar
- **Compressor de Imagens** — slider de qualidade, largura máxima e conversão de formato (JPEG/WebP/AVIF/PNG, aceita HEIC à entrada), com comparação antes/depois de divisória arrastável, zoom à roda do rato e o tamanho final em tempo real

## Stack

- HTML, CSS e JavaScript puro — sem frameworks, sem bundler, sem `npm install`
- Tudo corre no browser: nenhum dado sai do dispositivo do utilizador
- Exceção à regra do «sem dependências»: nenhum browser além do Safari sabe abrir HEIC, por isso o descodificador `libheif-js` é carregado do jsDelivr — só na primeira vez que abres um ficheiro `.heic`, e a imagem continua a nunca sair do dispositivo
- Toggle de tema claro/escuro com preferência guardada em `localStorage`
- Pronto para GitHub Pages: basta abrir `index.html` ou publicar a raiz do repositório

## Estrutura

```
index.html   # marcação
styles.css   # estilos
script.js    # lógica de todas as ferramentas
```

## Créditos

O núcleo de geração de QR code usa o algoritmo da biblioteca [qrcode-generator](https://github.com/davidshimjs/qrcodejs) de Kazuhiko Arase (MIT).

A leitura de HEIC usa o [libheif-js](https://github.com/catdad-experiments/libheif-js), um build para browser do [libheif](https://github.com/strukturag/libheif) (LGPL-3.0), carregado do CDN a pedido.
