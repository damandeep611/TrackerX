"use client"
import SignIn from '@/components/auth/sign-in';
import gsap from 'gsap';
import React, { useEffect, useRef } from 'react';


type LoginModalProps =  {
  isOpen: boolean
  onClose: ()=> void
}

export default function LoginModal({isOpen, onClose}:LoginModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(()=> {
    if(!modalRef.current || !modalContentRef.current) return

    const tl = gsap.timeline({paused: true})

    //setup intial state
    gsap.set(modalRef.current, {autoAlpha: 0})
    gsap.set(modalContentRef.current, {y: 50, autoAlpha: 0})

    //animations
    tl.to(modalRef.current,{
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.inOut",
    }).to(
      modalContentRef.current,{
        y: 0,
        autoAlpha: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      },
      "-=0.1"
    )
    //also reverese animation on open state
    if(isOpen){
      tl.play()
    }else{
      tl.reverse()
    }
    return ()=> {
      tl.kill()
    }
  },[isOpen])
  

  //close on clicking outside the modal
  const handleBackdropClick = (e:React.MouseEvent)=> {
    if(e.target === modalRef.current) onClose()
  }

  if(!isOpen) return null;
  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        ref={modalContentRef}
        className="relative flex w-full max-w-6xl overflow-hidden rounded-lg shadow-xl"
      >
        {/* left side  */}
        <div className="w-2/3 bg-white p-8">
          <div className="flex h-full flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                  Let&apos;s get started
                </h2>
                <p className="mt-2 text-gray-600">Sign in/Sign up</p>
              </div>

              <div className="mt-8 space-y-6   ">
                <SignIn />

                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 flex-shrink text-gray-500">Or</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="text-center">
                  <button className="inline-flex items-center text-gray-700 hover:text-gray-900">
                    Continue with Email
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-1 h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                  By signing up, you confirm that you agree to our terms,
                  license agreement and privacy policy.
                </p>
                <div className="mt-2 flex justify-center space-x-2">
                  <a href="#" className="hover:text-gray-700">
                    License
                  </a>
                  <span>|</span>
                  <a href="#" className="hover:text-gray-700">
                    Privacy Policy
                  </a>
                  <span>|</span>
                  <a href="#" className="hover:text-gray-700">
                    Terms
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* dashboard demo image */}
        <div className="relative w-1/3">
          <div className="absolute inset-0 bg-blue-200">
            <div className="h-full w-full grid grid-cols-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-blue-300"></div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black p-6 text-white">
            <h3 className="text-2xl font-bold">
              Bookmarking Resources Feature for Skills Coming soon...
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              This Project is in Beta so Changes may be seen frequently, for any
              feedback or new Feature suggestion just drop a message with email
              by clicking This Feedback{" "}
            </p>
          </div>
        </div>

        {/* close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
