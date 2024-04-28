package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/rs/cors"
)

func main() {
	distFs := http.Dir("../dist")
	distServer := http.FileServer(distFs)
	proxy := httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "https", Host: "ktane.timwi.de", Path: "/"})
	allowAll := cors.AllowAll

	srv := &http.Server{
		Addr: ":8080",
		Handler: allowAll().Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, "/proxy/") {
				r2 := r.Clone(r.Context())
				r2.URL.Path = strings.TrimPrefix(r.URL.Path, "/proxy")
				r2.Host = "ktane.timwi.de"
				proxy.ServeHTTP(w, r2)
				return
			}

			distServer.ServeHTTP(w, r)
		})),
	}
	srv.ListenAndServe()
}
