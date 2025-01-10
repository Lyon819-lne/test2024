function search() {
    const query = document.getElementById('searchBox').value;
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = `搜索结果：${query}`;
}