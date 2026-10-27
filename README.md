# Studio Ghibli

Catálogo interativo de filmes do Studio Ghibli, desenvolvido em HTML, CSS e JavaScript puro. A aplicação consome a API pública do Studio Ghibli, permite pesquisar, ordenar, favoritar filmes e alternar entre os modos claro/escuro.

## Objetivo

Este projeto foi criado para explorar e demonstrar:

- consumo de API externa em JavaScript;
- renderização dinâmica de elementos na página;
- filtros e ordenação de conteúdo;
- persistência de preferências com localStorage;
- interface responsiva e visual moderna.

## Funcionalidades

- Listagem de filmes do Studio Ghibli;
- busca por título, diretor ou título original;
- filtro por diretor;
- ordenação por ano, pontuação, título e duração;
- sistema de favoritos;
- alternância de idioma entre português e inglês;
- modo claro e escuro;
- modal com detalhes do filme.

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6+
- API pública: https://ghibliapi.vercel.app/films

## Estrutura do projeto

```text
.
├── app.js
├── index.html
├── style.css
├── README.md
```

## Como executar

### Opção 1: abrir diretamente no navegador

1. Abra o arquivo `index.html` em um navegador.
2. Certifique-se de estar conectado à internet, pois a aplicação busca os dados em uma API externa.

### Opção 2: usar um servidor local

No terminal, na pasta do projeto, execute:

```bash
python3 -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000
```

## Observações

- A aplicação usa `fetch()` para acessar a API pública do Studio Ghibli.
- Caso a API esteja indisponível, a interface exibe uma mensagem de erro.
- As preferências de favoritos, idioma e tema são salvas no navegador via `localStorage`.

## Autor

Projeto desenvolvido como página web estática em JavaScript puro.
