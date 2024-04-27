package main

import (
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

func main() {
	distFs := http.Dir("../dist")
	distServer := http.FileServer(distFs)
	proxy := httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "https", Host: "ktane.timwi.de", Path: "/HTML/"})

	srv := &http.Server{
		Addr: ":8080",
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/proxy/blank.html" {
				r.URL.Path = "/proxy/blank.html"
				proxyFile, err := distFs.Open("proxy/blank.html")
				if err != nil {
					http.Error(w, "500 Internal Server Error", http.StatusInternalServerError)
					return
				}
				defer proxyFile.Close()
				w.Header().Set("Content-Type", "text/html")
				io.Copy(w, proxyFile)
				return
			}
			if strings.HasPrefix(r.URL.Path, "/proxy/") {
				r2 := r.Clone(r.Context())
				r2.URL.Path = strings.TrimPrefix(r.URL.Path, "/proxy")
				r2.Host = "ktane.timwi.de"
				proxy.ServeHTTP(w, r2)
				return
			}

			distServer.ServeHTTP(w, r)
		}),
	}
	srv.ListenAndServe()
}
