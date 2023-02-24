package siriusHelper

import (
	"math/rand"
)

//Random string generation
func RandomString(n int) string {
    var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

    s := make([]rune, n)
    for i := range s {
        s[i] = letters[rand.Intn(len(letters))]
    }
    return string(s)
}

func ErrorCheck(e error) {
    if e != nil {
        panic(e)
    }
}
