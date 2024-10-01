document.addEventListener("DOMContentLoaded", () => {
  const produtosContainer = document.getElementById("produtosContainer");
  const favoritosContainer = document.getElementById("favoritosContainer");
  const filtroInput = document.getElementById("filtroInput");
  const filtroTipo  = document.getElementById("filtroTipo");

  const url = 'http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline';

  let produtos = [];
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  async function carregarProdutos() {
    try {
      const response = await fetch(url);
      produtos = await response.json();
      exibirProdutos(produtos);
      exibirFavoritos();
    } catch (error) {
      console.error('Erro ao carregar produtos', error);
    }
  }

  function exibirProdutos(produtos) {
    produtosContainer.innerHTML = produtos.slice().map(produto => `
      <div class="produto" data-id="${produto.id}">
        <img src="${produto.image_link}" alt="${produto.name}">
        <h3>${produto.name}</h3>
        <p>${produto.category || 'Sem categoria'}</p>
        <button class="favoritar">Favoritar</button>
        <div class="details" style="display:none;">
          <p>${produto.description || 'Sem descrição'}</p>
          <p>Preço: ${produto.price || 'Não informado'}</p>
        </div>
      </div>
    `).join('');
    document.querySelectorAll('.produto').forEach(produtoElement => {
      produtoElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('favoritar')) {
          toggleFavorito(produtoElement.dataset.id);
        } else {
          toggleDetails(produtoElement);
        }
      });
    });
  }

  function toggleDetails(produtoElement) {
    const details = produtoElement.querySelector('.details');
    const isVisible = details.style.display === 'block';
    details.style.display = isVisible ? 'none' : 'block';
  }

  function toggleFavorito(produtoId) {
    const produto = produtos.find(p => p.id == produtoId);
    const favoritoIndex = favoritos.findIndex(fav => fav.id == produto.id);

    if (favoritoIndex === -1) {
      favoritos.push(produto);
    } else {
      
      favoritos.splice(favoritoIndex, 1);
    }

    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    exibirFavoritos();
  }

  function exibirFavoritos() {
    if (favoritos.length === 0) {
      favoritosContainer.innerHTML = '<p>Nenhum favorito adicionado.</p>';
    } else {
      favoritosContainer.innerHTML = favoritos.map(fav => `
        <div class="favorito">
          <img src="${fav.image_link}" alt="${fav.name}">
          <h3>${fav.name}</h3>
          <button class="remove-btn" data-id="${fav.id}">Remover</button>
        </div>
      `).join('');
      
      
      document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', () => {
          removeFavorito(button.dataset.id);
        });
      });
    }
  }
 
  function removeFavorito(produtoId) {
    favoritos = favoritos.filter(fav => fav.id != produtoId);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    exibirFavoritos();
  }

  filtroInput.addEventListener('input', () => {
    const searchTerm = filtroInput.value.toLowerCase();
    const filteredProducts = produtos.filter(produto =>
      produto.name.toLowerCase().includes(searchTerm) ||
      (produto.category && produto.category.toLowerCase().includes(searchTerm))
    );
    exibirProdutos(filteredProducts);
  });

  filtroTipo.addEventListener('change', (event) => {
    const tipoSelecionado = event.target.value;

    if (tipoSelecionado === 'todos') {
      exibirProdutos(produtos);
    } else {
      const produtosFiltrados = produtos.filter(produto => 
        produto.product_type === tipoSelecionado
      );
      exibirProdutos(produtosFiltrados);
    }
  });

  
  carregarProdutos();
});

