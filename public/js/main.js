document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/") {
    const logoutBtn = document.getElementsByClassName("logoutBtn")[0];
    // const deleteTaskBtnMain = document.getElementById("deleteBtn");
    // const deleteTaskBtns = document.getElementsByClassName("deleteBtns");

    // deleteTaskBtnMain.addEventListener("click", () => {
    //   deleteTaskBtns.forEach((btn) => {
    //     btn.classList.add("deleting");
    //   });
    // });

    logoutBtn.addEventListener("htmx:afterRequest", (e) => {
      if (e.detail.successful) {
        location.reload();
      }
    });
  }

  if (window.location.pathname === "/login") {
    const loginFrm = document.getElementById("loginForm");

    loginFrm.addEventListener("htmx:afterRequest", (e) => {
      if (e.detail.successful) {
        location.reload();
      }
    });
  }

  if (window.location.pathname === "/register") {
    const registerFrm = document.getElementById("registerForm");
    const loginBtn = document.getElementById("loginButton");

    registerFrm.addEventListener("htmx:afterRequest", (e) => {
      if (e.detail.successful) {
        location.reload();
      }
    });
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("DOM Content loaded");

//   if (window.location.pathname === "/login") {
//     const loginFrm = document.getElementById("loginForm");
//     const loginBtn = document.getElementById("loginButton");

//     loginFrm.addEventListener("htmx:afterRequest", (e) => {
//       if (e.detail.successful) {
//         let newButton = document.createElement("div");
//         newButton.innerHTML = `<button
//           hx-post="/account/logout"
//           hx-replace-url="/login"
//           hx-target="#container"
//           hx-swap="innerHTML"
//           hx-indicator="#logout"
//           hx-swap-oob="true"
//           id="ogBtn"
//           class="flex bg-emerald-500 rounded-lg px-5 py-2 logoutBtn"
//           >
//           Logout
//           </button>`;

//         loginBtn.replaceWith(newButton);
//         console.log("Successful login");
//       }
//     });
//   }

//   if (window.location.pathname === "/register") {
//     const registerFrm = document.getElementById("registerForm");
//     const loginBtn = document.getElementById("loginButton");

//     registerFrm.addEventListener("htmx:afterRequest", (e) => {
//       if (e.detail.successful) {
//         let newButton = document.createElement("div");
//         newButton.innerHTML = `<button
//           hx-post="/account/logout"
//           hx-replace-url="/login"
//           hx-target="#container"
//           hx-swap="innerHTML"
//           hx-indicator="#logout"
//           hx-swap-oob="true"
//           id="ogBtn"
//           class="flex bg-emerald-500 rounded-lg px-5 py-2 logoutBtn"
//           >
//           Logout
//           </button>`;

//         loginBtn.replaceWith(newButton);
//         console.log("Successful registration");
//       }
//     });
//   }
// });
