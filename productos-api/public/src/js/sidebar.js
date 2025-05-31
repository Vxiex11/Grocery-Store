function setupSidebarTooltips() {
  const tooltip = document.getElementById("tooltip");
  if (!tooltip) return;

  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("mouseenter", () => {
      const rect = item.getBoundingClientRect();
      tooltip.textContent = item.getAttribute("data-tooltip");
      tooltip.style.top = `${rect.top + rect.height / 12}px`;
      tooltip.style.left = `${rect.right + 10}px`;
      tooltip.style.opacity = 1;
    });

    item.addEventListener("mouseleave", () => {
      tooltip.style.opacity = 0;
    });
  });
}

// Llamarla automáticamente al cargar el DOM
document.addEventListener("DOMContentLoaded", setupSidebarTooltips);