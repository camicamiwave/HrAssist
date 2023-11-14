(() => {
  const state = {};
  let context = null;
  let nodesToDestroy = [];
  let pendingUpdate = false;

  function destroyAnyNodes() {
    // destroy current view template refs before rendering again
    nodesToDestroy.forEach((el) => el.remove());
    nodesToDestroy = [];
  }

  // Function to update data bindings and loops
  // call update() when you mutate state and need the updates to reflect
  // in the dom
  function update() {
    if (pendingUpdate === true) {
      return;
    }

    pendingUpdate = true;

    document.querySelectorAll("[data-el='form-input']").forEach((el) => {
      el.setAttribute("required", true);
    });

    document.querySelectorAll("[data-el='form-input-2']").forEach((el) => {
      el.setAttribute("required", true);
    });

    document.querySelectorAll("[data-el='form-input-3']").forEach((el) => {
      el.setAttribute("required", true);
    });

    document.querySelectorAll("[data-el='form-input-4']").forEach((el) => {
      el.setAttribute("required", false);
    });

    document.querySelectorAll("[data-el='form-input-5']").forEach((el) => {
      el.setAttribute("required", false);
    });

    document.querySelectorAll("[data-el='form-input-6']").forEach((el) => {
      el.setAttribute("required", false);
    });

    document.querySelectorAll("[data-el='form-input-7']").forEach((el) => {
      el.setAttribute("required", false);
    });

    pendingUpdate = false;
  }
})();
