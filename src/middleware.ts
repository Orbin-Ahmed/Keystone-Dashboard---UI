import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  const cookieValue = request.cookies.get("id")?.value;
  let role;

  if (cookieValue) {
    role = parseInt(cookieValue, 10);
    const secret_key = "6595554882";
    role = role / Number(secret_key);
  } else {
    role = 4;
  }

  const commonRoutes = [
    "/",
    "/auth/login/",
    "/auth/register/",
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/settings",
  ];
  // Define the routes based on role
  const designerRoutes = ["/dashboard/add-image", "/dashboard/edit-image"];

  const adminRoutes = ["/dashboard/users"];

  const superUserRoutes = [...commonRoutes, ...adminRoutes, ...designerRoutes];

  if (role) {
    url.pathname = "/auth/login/";

    if (role !== 1 && adminRoutes.includes(pathname)) {
      return NextResponse.redirect(url);
    }

    if (role !== 3 && designerRoutes.includes(pathname)) {
      return NextResponse.redirect(url);
    }

    if (!(role === 3 || role === 1) && commonRoutes.includes(pathname)) {
      return NextResponse.redirect(url);
    }
  } else {
    url.pathname = "/auth/login/";
    return NextResponse.redirect(url);
  }
}
